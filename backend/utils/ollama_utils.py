import ollama

def models_available():
    models_list = ollama.list()
    models = [m.model for m in models_list.models]
    return models

def ollama_response_stream(modelName, user_prompt):
    try:
        stream = ollama.chat(
            model=modelName, 
            messages=[
                {
                    'role': 'user',
                    'content': user_prompt,
                },
            ],
            stream=True  # Enable streaming
        )
        
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                content = chunk['message']['content']
                if content:
                    yield content
    except Exception as e:
        yield f"Error: {str(e)}"