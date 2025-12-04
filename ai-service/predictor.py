from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np
import json

class SimplePredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50)
        self.scaler = StandardScaler()
        self.trained = False
    
    def train_on_crm_data(self, contracts_data):
        """Entraîne sur vos données CRM"""
        
        # Features simples
        X = []
        y = []
        
        for contract in contracts_data:
            features = [
                contract.get('montant', 0),
                contract.get('duration_days', 30),
                1 if contract.get('status') == 'active' else 0
            ]
            X.append(features)
            # Target: 1 si renouvelé, 0 sinon
            y.append(1 if contract.get('renewed', False) else 0)
        
        if len(X) > 5:  # Minimum de données
            X = self.scaler.fit_transform(X)
            self.model.fit(X, y)
            self.trained = True
    
    def predict_renewal(self, contract_data):
        """Prédit si le contrat sera renouvelé"""
        
        if not self.trained:
            return {
                'prediction': 'Pas assez de données',
                'confidence': 0,
                'action': 'Collectez plus de données'
            }
        
        features = [[
            contract_data.get('montant', 0),
            contract_data.get('duration_days', 30),
            1 if contract_data.get('status') == 'active' else 0
        ]]
        
        features = self.scaler.transform(features)
        proba = self.model.predict_proba(features)[0][1]
        
        return {
            'will_renew': proba > 0.6,
            'confidence': float(proba),
            'action': self.get_action(proba)
        }
    
    def get_action(self, proba):
        if proba > 0.8:
            return "✅ Client fidèle, proposez une offre premium"
        elif proba > 0.5:
            return "⚠️ Contactez pour fidélisation"
        else:
            return "🚨 Risque élevé, action urgente"