import React, { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
// import 'antd/dist/antd.css';

const { TextArea } = Input;

const App = () => {
  const [displayData, setDisplayData] = useState('');

  useEffect(() => {
    const socket = new WebSocket('wss://fstream.binance.com/stream?streams=bnbusdt@aggTrade/btcusdt@markPrice');

    const fetchData = () => {
      socket.send('Send data'); // 在这里发送 WebSocket 请求
    };

    const interval = setInterval(fetchData, 100); // 每隔 100ms 发送一次请求

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      // 处理接收到的数据，并更新显示框内容
      setDisplayData((prevData) => prevData + JSON.stringify(newData) + '\n');
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      clearInterval(interval); // 关闭 WebSocket 时清除定时器
    };

    return () => {
      clearInterval(interval); // 组件卸载时清除定时器
      socket.close(); // 组件卸载时关闭 WebSocket 连接
    };
  }, []); // 空数组作为 useEffect 的第二个参数，表示只在组件挂载和卸载时执行一次

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Button type="primary">Post</Button>
      </div>
      <div>
        <TextArea rows={8} placeholder="大显示框 1" readOnly={true} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <TextArea rows={8} value={displayData} readOnly={true} />
      </div>
    </div>
  );
};

export default App;
