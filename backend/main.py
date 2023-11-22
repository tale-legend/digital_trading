import tornado.ioloop
import tornado.web
import tornado.websocket
import json

# WebSocket 处理器
class MyWebSocketHandler(tornado.websocket.WebSocketHandler):
    connections = set()

    # def set_default_headers(self):
    #     self.set_header("Access-Control-Allow-Origin", "*")  # 允许所有来源访问，可以根据实际情况修改为特定的来源

    def check_origin(self, origin):
        return True

    def open(self):
        print("WebSocket opened")
        MyWebSocketHandler.connections.add(self)
        self.send_table_data()

    def on_close(self):
        print("WebSocket closed")
        MyWebSocketHandler.connections.remove(self)

    @classmethod
    def send_table_data(cls):
        # 模拟数据：10列和3行的数据
        data = [
            {"col1": "data11", "col2": "data12", "col3": "data13"},
            {"col1": "data21", "col2": "data22", "col3": "data23"},
            {"col1": "data31", "col2": "data32", "col3": "data33"}
        ]
        table_data = json.dumps(data)

        for connection in cls.connections:
            try:
                connection.write_message(table_data)
            except:
                print("Error sending message")

def make_app():
    return tornado.web.Application([
        (r"/websocket", MyWebSocketHandler),
    ])

if __name__ == "__main__":
    app = make_app()
    app.listen(8088)
    print("Server started at port 8088")
    tornado.ioloop.IOLoop.current().start()
