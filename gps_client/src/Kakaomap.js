/* global kakao */
import React, { useEffect } from 'react';
import ROSLIB from 'roslib'
const Kakaomap = () => {
    //처음 지도 그리기
    useEffect(()=>{
        var container = document.getElementById('map');
        var options = {
            center: new kakao.maps.LatLng(35.91325, 128.80298),
            level: 3
        };
        var map = new kakao.maps.Map(container, options);

        //마커생성
        var markerPosition  = new kakao.maps.LatLng(35.91325, 128.80298);
        var marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);

        //마커 위도 경도 표시
        kakao.maps.event.addListener(map, 'marker_changed', function() {
            var message = '<p>중심 좌표는 위도 ' + marker.getPosition().getLat() + ', 경도 ' + marker.getPosition().getLng() + '입니다</p>';
            var resultDiv = document.getElementById('result');
            resultDiv.innerHTML = message;
        });

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
             messageType : 'sensor_msgs/NavSatFix'
         });

         listener.subscribe(function(message) {
             console.log('Received message on' + listener.name + ': ' + message.data);
             markerPosition = kakao.maps.LatLng(listener.latitude, listener.longitude);
             var latlng = markerPosition;
             marker.setPosition(latlng);
        });

    },[])


    return (
        <div
            style={{
                width: '100%',
                display: 'inline-block',
                marginLeft: '5px',
                marginRight: '5px',
            }}
        >
            <div id="map" style={{ width: '99%', height: '500px' }}></div>
            <div id="result"></div>
            <div>test</div>
        </div>
    );
};

export default Kakaomap;