from tinydb import TinyDB, Query
import datetime
import os

class TinyDB_Utils:
    def __init__(self, db_path):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db = TinyDB(db_path)
        self.conversation = Query()

    def save_conversation(self, user=None, model=None):
        if user is not None and model is not None:
            raise ValueError("Provide only one: either user or model, not both.")
        if user is not None:
            message = {"user": user}
        elif model is not None:
            message = {"model": model}
        else:
            raise ValueError("Either user or model must be provided.")
        self.db.insert(message)
    def get_collection_conversation_history(self):
        return self.db.all()

class TinyDB_Utils_Global:
    def __init__(self, db_path="./db/conversations_history.json"):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db = TinyDB(db_path)
        self.conversation = Query()
    
    def save_history(self, summary, conversation_id, modelName, collectionName):
        history = {
            "DateAndTime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "conversation_summary": summary,
            "conversation_id": conversation_id,
            "modelName": modelName,
            "collectionName": collectionName
        }
        self.db.insert(history)

    def get_history(self):
        results = self.db.all()
        return [
            {
                "conversation_summary": r["conversation_summary"],
                "conversation_id": r["conversation_id"],
                "modelName": r["modelName"],
                "collectionName": r["collectionName"]
            }
            for r in results
        ]

    
    def get_uid_history(self, uid):
        return self.db.search(self.conversation.conversation_id == uid)
