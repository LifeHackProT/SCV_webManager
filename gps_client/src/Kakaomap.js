/* global kakao */
import './App.css';
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

        //rosbag 메세지 출력
        listener.subscribe(function(message) {
            console.log('Received message on' + listener.name
                + '\nlongtitude : ' + JSON.stringify(message.longitude)
                + '\nlatitude : ' + JSON.stringify(message.latitude),
            );

        });

        //마커위도경도표시


    return (
        <div>
            <Map // 지도를 표시할 Container
                center={{
                    // 지도의 중심좌표
                    lat: 35.91325,
                    lng: 128.80298,
                }}
                style={{
                    // 지도의 크기
                    width: "100%",
                    height: "450px",
                }}
                level={2} // 지도의 확대 레벨
            >
                <MapMarker position={{
                    lat: 35.91325,
                    lng: 128.80298
                }}
                draggable={true}
                    ></MapMarker>
            </Map>
        </div>
    );
};

export default Kakaomap;