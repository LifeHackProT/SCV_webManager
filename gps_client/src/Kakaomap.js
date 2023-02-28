/* global kakao */
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import * as ROS3D from 'ros3d';
import { MapMarker, Map, Polyline } from "react-kakao-maps-sdk";
const Kakaomap = () => {

    /**
     * --------카카오 맵 설정--------
     * */
    //지도 중심좌표
    const [state, setState] = useState({
        center: {
            lat: 35.91325,
            lng: 128.80298,
        },
        errMsg: null,
        isLoading: true,
    })

    //마커 위도경도
    const [markLoc, setMarkLoc] = useState([{
        lat : state.center.lat,
        lng : state.center.lng,
    }]);

    //마커 이동 선 표시
    const [line, setLine] = useState ([{
        lat : state.center.lat,
        lng : state.center.lng,
    },])


    /**
     * ---------ROS gps 연결----------
     * */
    //웹소켓 사용 ROSLIB websocket
    let rosbridge_url = 'ws://localhost:9090';
    let ros = new ROSLIB.Ros({
        url: rosbridge_url
    });

    //ros 연결 상태 출력
    ros.on('connection', function(){
        console.log('Connected to websocket server.');
    });
    ros.on('error', function(error){
        console.log('Error connecting to websocket server: ', error);
        window.location.reload(); //오류뜰 때 사이트 새로고침
    });
    ros.on('close', function(){
        console.log('Connection to websocket server closed.');
    });

    //Subscribing to a Topic, kakaoMap gps data
    let listener = new ROSLIB.Topic({
        ros : ros,
        name : '/converted_gps_data',
        messageType : "sensor_msgs/NavSatFix"
    });

    useEffect(
        () => {
            //rosbag 카카오 맵 gps 메세지 콘솔창 출력
            listener.subscribe(function(message) {
                console.log('Received message on' + listener.name
                    + '\nlatitude : ' + message.latitude
                    + '\nlongtitude : ' + message.longitude,
                );
                //마커 위도 경도 변경
                setMarkLoc({
                    lat: message.latitude, lng: message.longitude
                })
                //중심 좌표 이동
                setState({
                    center: { lat: message.latitude, lng: message.longitude }
                })
                // 마커 이동 선 표시
                /*const onCreate = () => {
                    const newLine = {
                        lat: message.latitude,
                        lng: message.longitude,
                    };
                    setLine([...line, newLine]);
                }*/
            });
            return () => {
                listener.unsubscribe();
            }
        },)

    /**
     * ------velodyne ROS3D 연결-------
     * */
    /**
     * Setup all visualization elements when the page is loaded.
     * FROM. https://github.com/RobotWebTools/ros3djs/blob/develop/examples/pointcloud2.html
     */

    // Create the main viewer.
    let viewer = new ROS3D.Viewer({
            divID: 'viewer',
            width: 800,
            height: 600,
            antialias: true,
        });

    // Set up a client to listen to TFs.
    let tfClient = new ROSLIB.TFClient({
        ros : ros,
        angularThres: 0.01,
        transThres: 0.01,
        rate: 10.0,
        fixedFrame: '/velodyne'
    });

    let cloudClient = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: tfClient,
        rootObject: viewer.scene,
        topic: '/velodyne_points',
        material: { size: 0.05, color: "ff0000" }
    });

    return (
        <div>
            <div>
                <div className={"velodyne-viewer"} id={'viewer'}></div>
            </div>
            <Map // 카카오 맵 지도를 표시할 Container
                center={state.center}
                style={{
                    // 지도의 크기
                    display: 'inline-block',
                    marginLeft: '5px',
                    marginRight: '5px',
                    width: "100%",
                    height: "450px",
                }}
                level={2} // 지도의 확대 레벨
            >
                <MapMarker position={{ //마커 표시
                    lat: markLoc.lat,
                    lng: markLoc.lng,
                }}></MapMarker>
                <Polyline path = {[//마커 이동 선 표시
                    { lat: line.lat, lng: line.lng },
                ]}
                          strokeWeight = {3} //선 두께
                         strokeColor = {"#39DE2A"} //선 색깔
                         strokeOpacity = {0.8} //선의 불투명도
                         strokeStyle = {"solid"} //선의 스타일
                ></Polyline>
            </Map>
            <h1>마커 위치</h1>
            <h1>{'위도 : ' + markLoc.lat}</h1>
            <h1>{'경도 : ' + markLoc.lng}</h1>
        </div>
    );
};

export default Kakaomap;