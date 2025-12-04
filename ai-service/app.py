from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import FreeChatbot
from predictor import SimplePredictor
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = FreeChatbot()
predictor = SimplePredictor()

# ✅ URL DU BACKEND (modifiez selon votre config)
BACKEND_URL = "http://localhost:5000"

class ChatRequest(BaseModel):
    message: str

class PredictRequest(BaseModel):
    contract_id: int

@app.get("/")
async def root():
    return {"status": "IA CRM Active", "model": "Ollama Llama 3.2"}

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chatbot avec accès aux données CRM"""
    try:
        # ✅ RÉCUPÈRE LES VRAIES DONNÉES DU BACKEND
        crm_data = {}
        
        try:
            # Stats globales
            stats = requests.get(f"{BACKEND_URL}/api/stats/dashboard", timeout=3).json()
            crm_data['stats'] = stats
            
            # Liste des clients
            clients = requests.get(f"{BACKEND_URL}/api/clients", timeout=3).json()
            crm_data['clients'] = clients
            
            # Liste des contrats
            contracts = requests.get(f"{BACKEND_URL}/api/contracts", timeout=3).json()
            crm_data['contracts'] = contracts
            
        except Exception as e:
            print(f"Erreur récupération données: {e}")
        
        response = chatbot.chat(request.message, crm_data)
        return {"response": response}
    
    except Exception as e:
        print(f"Erreur chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-renewal")
async def predict(request: PredictRequest):
    """Prédit renouvellement d'un contrat"""
    try:
        contract = requests.get(
            f"{BACKEND_URL}/api/contracts/{request.contract_id}",
            timeout=3
        ).json()
        
        prediction = predictor.predict_renewal(contract)
        return prediction
    except Exception as e:
        print(f"Erreur prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train():
    """Entraîne le modèle sur vos données"""
    try:
        contracts = requests.get(f"{BACKEND_URL}/api/contracts", timeout=5).json()
        predictor.train_on_crm_data(contracts)
        return {
            "status": "Modèle entraîné avec succès",
            "contracts_used": len(contracts)
        }
    except Exception as e:
        print(f"Erreur entraînement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test-backend")
async def test_backend():
    """Teste la connexion au backend"""
    try:
        stats = requests.get(f"{BACKEND_URL}/api/stats/dashboard", timeout=3).json()
        clients = requests.get(f"{BACKEND_URL}/api/clients", timeout=3).json()
        contracts = requests.get(f"{BACKEND_URL}/api/contracts", timeout=3).json()
        
        return {
            "backend_status": "✅ Connecté",
            "clients_count": len(clients),
            "contracts_count": len(contracts),
            "revenue": stats.get('revenue', 0)
        }
    except Exception as e:
        return {
            "backend_status": "❌ Erreur",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)