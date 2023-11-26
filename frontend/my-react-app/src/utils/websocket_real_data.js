import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';


function formatTimestampWithMilliseconds(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 3 // 设置毫秒数的显示位数
  };

  const dateFormatter = new Intl.DateTimeFormat('default', options);
  return dateFormatter.format(date);
}

function DisplayBox1({data}) {
  return (
    <Input.TextArea value={data} readOnly rows={8} style={{ margin: '20px', padding: '5px', flex: 1, maxWidth: '90%'}} />
  );
}

function DisplayBox2({data}) {
  return (
    <Input.TextArea value={data} readOnly rows={20} style={{ margin: '20px', padding: '5px', flex: 1, maxWidth: '90%'}} />
  );
}

const DisplayBox = () => {
  const [data1, setData1] = useState('');
  const [data2, setData2] = useState('');
  const [ws, setWs] = useState(null);
  const [isSending, setIsSending] = useState(false); // 控制发送请求的开关

  useEffect(() => {
    const socket = new WebSocket('ws://43.128.42.40:8088/websocket');
    // const socket = new WebSocket('wss://fstream.binance.com/stream?streams=bnbusdt@aggTrade/btcusdt@markPrice');
    let intervalId;

    socket.onopen = () => {
      console.log('WebSocket opened');
      setWs(socket);

      console.log('====================');
      console.log('开始发送数据...');
      socket.send('请求数据-');

    };

    socket.onmessage = (event) => {
      // console.log("Recive Message:" + event.data)

      const newData = JSON.parse(event.data);
      // console.log(newData)

      if (newData && newData[0] && newData[1]) {
        const data1 = newData[0]
        const data2 = newData[1]
        // console.log(data1);
        // console.log(data2);

        let data1_buy
        if (data1["b"][0] && data1["b"][0][0] !== undefined) {
          data1_buy = data1["b"][0][0]
        } else {
          data1_buy = ""
        }

        let data1_sell
        if (data1["a"][0] && data1["a"][0][0] !== undefined) {
          data1_sell = data1["a"][0][0]
        } else {
          data1_sell = ""
        }

        let data2_buy
        if (data2["b"][0] && data2["b"][0][0] !== undefined) {
          data2_buy = data2["b"][0][0]
        } else {
          data2_buy = ""
        }

        let data2_sell
        if (data2["a"][0] && data2["a"][0][0] !== undefined) {
          data2_sell = data2["a"][0][0]
        } else {
          data2_sell = ""
        }

        const display_data1 = "A:\t事件类型：\t" + data1["e"]
                  + "\t事件时间：\t" + formatTimestampWithMilliseconds(data1["E"])
                  + "\t交易对：\t" + data1["s"]
                  + "\t\t买1价：\t" + data1_buy
                  + "\t\t卖1价：\t" + data1_sell

        const display_data2 = "B:\t事件类型：\t" + data2["type"]
                  + "\t\t事件时间：\t" + formatTimestampWithMilliseconds(data2["ts"])
                  + "\t交易对：\t" + data2["s"]
                  + "\t\t买1价：\t" + data2_buy
                  + "\t\t卖1价：\t" + data2_sell

        let diff_rate1 = ""
        if (data2_buy && data1_sell) {
          diff_rate1 = (data2_buy - data1_sell) / data2_buy * 100
        }

        let diff_rate2 = ""
        if (data1_buy && data2_sell) {
          diff_rate2 = (data1_buy - data2_sell) / data1_buy * 100
        }

        const display_rate1 = "A买B卖价差率：\t" + diff_rate1 + "%"
        const display_rate2 = "A卖B买价差率：\t" + diff_rate2 + "%"

        const boundary = "================================================================================================="
        const display_data = boundary + "\n"
                        + display_data1 + "\n"
                        + display_data2 + "\n"
                        + display_rate1 + "\n"
                        + display_rate2 + "\n"
                        + boundary + "\n"

        // console.log(display_data);
        setData1(display_data);
        // setData2((prevData) => prevData + display_data + '\n');
      } else {
        // 处理数据为空或者属性不存在的情况
        console.error("Received data format is incorrect or missing properties.");
      }


    };


    // 在组件卸载时清除定时器和关闭 WebSocket 连接
    return () => {
      clearInterval(intervalId);
      socket.close();
    };
    // console.log("1111")

  }, []); // 空的依赖数组确保此效果仅运行一次

  return (
    <div>
      {/* <Input.TextArea value={data1} readOnly rows={8} style={{ margin: '20px', padding: '5px', flex: 1, maxWidth: '90%'}} />
      <Input.TextArea value={data2} readOnly rows={20} style={{ margin: '20px', padding: '5px', flex: 1, maxWidth: '90%'}} /> */}
      <DisplayBox1 data={data1} />
      {/*<DisplayBox2 data={data2} /> */}

    </div>
  );

};

export default DisplayBox;
