import ollama
import json

class FreeChatbot:
    def __init__(self):
        self.model = "llama3.2:1b"  # 1GB seulement !
    
    def chat(self, message, crm_data=None):
        """Chatbot avec accès aux données CRM réelles"""
        
        context = "Tu es un assistant CRM intelligent.\n\n"
        
        if crm_data:
            # Stats globales
            if 'stats' in crm_data:
                stats = crm_data['stats']
                context += f"""📊 STATISTIQUES CRM:
- Clients: {stats.get('clientCount', 0)}
- Contrats: {stats.get('contractCount', 0)}
- Revenu total: {stats.get('revenue', 0)}€

"""
            
            # Liste des clients (✅ VÉRIFICATION AJOUTÉE)
            if 'clients' in crm_data:
                clients = crm_data['clients']
                # ✅ Vérifiez que c'est bien une liste
                if isinstance(clients, list) and len(clients) > 0:
                    context += "👥 CLIENTS:\n"
                    for client in clients[:5]:  # Max 5 clients
                        context += f"- {client.get('name', 'N/A')} ({client.get('email', 'N/A')})\n"
                    context += "\n"
            
            # Liste des contrats (✅ VÉRIFICATION AJOUTÉE)
            if 'contracts' in crm_data:
                contracts = crm_data['contracts']
                # ✅ Vérifiez que c'est bien une liste
                if isinstance(contracts, list) and len(contracts) > 0:
                    context += "📄 CONTRATS:\n"
                    for contract in contracts[:5]:  # Max 5 contrats
                        context += f"- Contrat #{contract.get('id', 'N/A')} - {contract.get('montant', 0)}€ - Statut: {contract.get('status', 'N/A')}\n"
                    context += "\n"
        
        prompt = f"""{context}

Question de l'utilisateur: {message}

Réponds de manière claire, professionnelle et en français. Utilise les données CRM ci-dessus pour répondre précisément.

Réponse:"""
        
        try:
            response = ollama.generate(
                model=self.model,
                prompt=prompt
            )
            return response['response']
        except Exception as e:
            return f"❌ Erreur Ollama: {str(e)}\n\nAssurez-vous que le modèle '{self.model}' est téléchargé avec: ollama pull {self.model}"