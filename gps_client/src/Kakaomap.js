/* global kakao */
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import { MapMarker, Map } from "react-kakao-maps-sdk";
const Kakaomap = () => {

    //
    //     //마커 위도 경도 표시
    //     kakao.maps.event.addListener(map, 'marker_changed', function() {
    //         var message = '<p>중심 좌표는 위도 ' + marker.getPosition().getLat() + ', 경도 ' + marker.getPosition().getLng() + '입니다</p>';
    //         var resultDiv = document.getElementById('result');
    //         resultDiv.innerHTML = message;
    //     });
    //

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
    var ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090'
    });
    ros.on('connection', function(){
        console.log('Connected to websocket server.');
    });
    ros.on('error', function(error){
        console.log('Error connecting to websocket server: ', error);
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

    //마커 위도경도
    const [markLat, setMarkLat] = useState();
    const [markLng, setMarkLng] = useState();

    useEffect(
        () => {
            //rosbag 메세지 콘솔창 출력
            listener.subscribe(function(message) {
                console.log('Received message on' + listener.name
                    + '\nlongtitude : ' + message.longitude
                    + '\nlatitude : ' + message.latitude,
                );
                //마커 위도경도 변화
                setMarkLat(message.latitude);
                setMarkLng(message.longitude);
                //중심 좌표 이동
                setState({
                    center: { lat: message.latitude, lng: message.longitude }
                })
            });
            return () => {
                listener.unsubscribe();
            }
        },
        []
    )


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
                <MapMarker position={{
                    lat: markLat,
                    lng: markLng,
                }}></MapMarker>
            </Map>
            <h1>마커 위치</h1>
            <h1>{'위도 : ' + markLat}</h1>
            <h1>{'경도 : ' + markLng}</h1>
        </div>
    );
};

export default Kakaomap;