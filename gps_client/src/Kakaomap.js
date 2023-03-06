/* global kakao */
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import * as ROS3D from 'ros3d';
import { MapMarker, Map, Polyline } from "react-kakao-maps-sdk";
import './Kakaomap.css';
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

    useEffect(
        () => {
            /**
             * ---------ROS gps 연결----------
             * */
            //웹소켓 사용 ROSLIB websocket
            let rosbridge_url = 'ws://localhost:9090';
            let ros = new ROSLIB.Ros({
                url: rosbridge_url
            });

            //ros 연결 상태
            ros.on('connection', function(){
                console.log('Connected to websocket server.');
                //Subscribing to a Topic, kakaoMap gps data
                let listener = new ROSLIB.Topic({
                    ros : ros,
                    name : '/converted_gps_data',
                    messageType : "sensor_msgs/NavSatFix"
                });
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

                /**
                 * ------velodyne ROS3D 연결-------
                 * */

                    // Create the main viewer.
                let viewer = new ROS3D.Viewer({
                        divID: 'viewer',
                        width: 800,
                        height: 600,
                        antialias: true,
                    });
                viewer.addObject(new ROS3D.Grid());

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
                    material: { size: 0.05, color: "#39DE2A",
                        },
                    max_pts: 100000
                });
            });
            ros.on('error', function(error){
                console.log('Error connecting to websocket server: ', error);
                window.location.reload(); //오류뜰 때 사이트 새로고침
            });
            ros.on('close', function(){
                console.log('Connection to websocket server closed.');
            });

            return () => { }

        },[])

    return (
        <div>
            <h2 className={'header'}>마커 위치</h2>
            <div className={'text-container'}>
                <p>{'위도 : ' + markLoc.lat}</p>
                <p>{'경도 : ' + markLoc.lng}</p>
                <p className={'h-line'}></p>
            </div>

            <Map // 카카오 맵 지도를 표시할 Container
                center={state.center}
                className={'map'}
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


            <h3 className={'header'}> velodyne </h3>
            <div>
                <div //velodyne 표시
                    className={'box-column'} id={'viewer'}>
                </div>
            </div>
        </div>
    );
};

export default Kakaomap;