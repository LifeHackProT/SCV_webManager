/* global kakao */
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import ROS3D from 'roslib';
import { MapMarker, Map, Polyline } from "react-kakao-maps-sdk";
const Kakaomap = () => {

    //지도 중심좌표
    const [state, setState] = useState({
        center: {
            lat: 35.91325,
            lng: 128.80298,
        },
        errMsg: null,
        isLoading: true,
    })

    //웹소켓 사용 ROSLIB websocket
    var rosbridge_url = 'ws://localhost:9090';

    var ros = new ROSLIB.Ros({
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

    //Subscribing to a Topic
    var listener = new ROSLIB.Topic({
        ros : ros,
        name : '/converted_gps_data',
        messageType : "sensor_msgs/NavSatFix"
    });

    //velodyne 연결
    var viewer = new ROS3D.Viewer({
        divID : 'viewer',
        width : 800,
        height : 600,
        antialias : true
    });

    var tfClient = new ROSLIB.TFClient({
        ros : ros,
        angularThres : 0.01,
        transThres : 0.01,
        rate : 10.0,
        fixedFrame : '/velodyne'
    });

    //Create Kinect scene node
    var kinectNode = new ROS3D.SceneNode({
        frameID : 'velodyne',
        tfClient : tfClient,
        object : PointCloud2
    });

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
            //rosbag 메세지 콘솔창 출력
            listener.subscribe(function(message) {
                console.log('Received message on' + listener.name
                    + '\nlatitude : ' + message.latitude
                    + '\nlongtitude : ' + message.longitude,
                );
                //마커 위도경도 변경
                setMarkLoc({
                    lat: message.latitude, lng: message.longitude
                })
                //중심 좌표 이동
                setState({
                    center: { lat: message.latitude, lng: message.longitude }
                })
                // //선 표시
                // const onCreate = () => {
                //     const newLine = {
                //         lat: message.latitude,
                //         lng: message.longitude,
                //     };
                //     setLine([...line, newLine]);
                // }
            });
            return () => {
                listener.unsubscribe();
            }
        },)

    return (
        <div>
            <Map // 지도를 표시할 Container
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