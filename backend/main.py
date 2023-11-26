from typing import Any
import tornado
from tornado import httputil
import tornado.websocket
import tornado.ioloop
import tornado.web
import asyncio
import websockets
import time
import json
import traceback
from datetime import datetime

class WebSocketHandler(tornado.websocket.WebSocketHandler):

    def open(self):
        print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        print("WebSocket opened")

    def on_close(self):
        print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        print("WebSocket closed")

    def check_origin(self, origin):
        # 检查来源是否合法，如果合法返回True，否则返回False
        return True  # 允许所有来源的连接

    async def receive_process_data(self, websocket, type):
        while True:
            try:
                message = await websocket.recv()
                if type == "Binance":
                        depth_data = json.loads(message)
                        depth_data['b'] = depth_data['b'][:1] if depth_data['b'] else []
                        depth_data['a'] = depth_data['a'][:1] if depth_data['a'] else []
                elif type == "Bybit":
                        ret_data = json.loads(message)
                        depth_data = ret_data["data"]
                        depth_data['b'] = depth_data['b'][:1] if depth_data['b'] else []
                        depth_data['a'] = depth_data['a'][:1] if depth_data['a'] else []
                        depth_data['type'] = ret_data["type"]
                        depth_data['ts'] = ret_data["ts"]
            except:
                print("获取的数据不对！==")
                print(f"--data: {ret_data}")
                traceback.print_exc()
                print("++==")
                depth_data = {}

            if depth_data:
                break

        return depth_data

    async def send_heartbeat(self, websocket, data, interval):
        while True:
            try:
                # 发送心跳消息
                print("Send Heartbeat.")
                await websocket.send(data)
                await asyncio.sleep(interval)  # 每隔x秒发送一次心跳消息
            except websockets.exceptions.ConnectionClosed as e:
                print("WebSocket connection closed while sending heartbeat:", e)  # 打印异常信息
                break

    async def on_message(self, message):
        symbol = "BTCUSDT"
        lower_symbol = symbol.lower()
        simple_symbol = lower_symbol[3:]
        levels1 = 5 # levels表示几档买卖单信息, 可选：5/10/20档
        update_speed = "100ms"  # 可选：250ms 或 500ms 或 100ms
        levels2 = 200

        uri1 = f"wss://fstream.binance.com/ws/{lower_symbol}@depth{levels1}@{update_speed}"
        uri2 = f"wss://stream.bybit.com/contract/{simple_symbol}/public/v3"
        print(f"uri1: {uri1}")
        print(f"uri2: {uri2}")

        request_data2 = {
            "op": "subscribe",
            "args": [
                f"orderbook.{levels2}.{symbol}"
            ]
        }

        # 处理前端发送的消息
        print(f"="*50)
        print(f"发送异步请求")

        # 向另一个服务器发送WebSocket请求
        async with websockets.connect(uri1, ping_interval=None) as websocket1:
            async with websockets.connect(uri2, ping_interval=None) as websocket2:
                print(f"===request_data2: {request_data2}")
                await websocket2.send(json.dumps(request_data2))
                response = await websocket2.recv()

                while True:
                    try:
                        print("="*80)

                        # 接收消息
                        message1 = await self.receive_process_data(websocket1, "Binance")
                        message2 = await self.receive_process_data(websocket2, "Bybit")

                        # 保证消息时间戳同步
                        if message1["E"] > message2["ts"]:
                            # 等待 message2 达到 message1 的时间戳
                            while message2["ts"] < message1["E"]:
                                message2 = await self.receive_process_data(websocket2, "Bybit")
                        elif message1["E"] < message2["ts"]:
                            # 等待 message1 达到 message2 的时间戳
                            while message1["E"] < message2["ts"]:
                                message1 = await self.receive_process_data(websocket1, "Binance")

                        total_data = [message1, message2]
                        total_data_str = json.dumps(total_data)
                        print(f"response1: {total_data_str}")

                        # 将从另一个服务器收到的数据发送回前端
                        self.write_message(total_data_str)

                    except websockets.exceptions.ConnectionClosed as e:
                        print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                        print("WebSocket connection closed while in a loop:", e)
                        break

def make_app():
    return tornado.web.Application([
        (r'/websocket', WebSocketHandler),
    ])

if __name__ == '__main__':
    app = make_app()
    app.listen(8088)
    print("Server started at port 8088")
    tornado.ioloop.IOLoop.current().start()
