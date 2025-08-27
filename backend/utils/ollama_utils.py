import ollama

def models_available():
    models_list = ollama.list()
    models = [m.model for m in models_list.models]
    return models

def ollama_response(modelName, user_prompt):
    response = ollama.chat(
        model=modelName, messages=[
            {
                'role': 'user',
                'content': user_prompt,
            },
        ]
    )
    return response['message']['content']