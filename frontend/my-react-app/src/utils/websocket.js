import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { w3cwebsocket as W3CWebSocket } from 'websocket';


const client = new W3CWebSocket('ws://43.128.42.40:8088/websocket'); // 替换为你的websocket地址

const WebSocketTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const newData = JSON.parse(message.data);
      setData(newData);
    };
  }, []);

  const columns = [
    // 表格列配置
    { title: 'ID', dataIndex: 'col1'},
    { title: 'Name', dataIndex: 'col2'},
    { title: 'Age', dataIndex: 'col3'},
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={true}
      // 其他表格配置项
      // 例如：scroll={{ y: 400 }}
    />
  );
};

export default WebSocketTable;
