import React from 'react';
import { useTradingConnection } from '../hooks/useTradingConnection';

const WebhookPanel: React.FC = () => {
  const {
    webhookConfig,
    triggerTestWebhook,
    updateWebhookConfig,
    connectionStatus
  } = useTradingConnection();
  
  const handleTestWebhook = async () => {
    const result = await triggerTestWebhook('EURUSD');
    if (result.success) {
      alert('Test webhook sent successfully!');
    }
  };
  
  const toggleWebhook = () => {
    updateWebhookConfig({ enabled: !webhookConfig.enabled });
  };
  
  return (
    <div className="webhook-panel">
      <h3>Webhook Configuration</h3>
      
      <div className="webhook-status">
        <span>Status: {webhookConfig.enabled ? '✅ Enabled' : '❌ Disabled'}</span>
        <button onClick={toggleWebhook}>
          {webhookConfig.enabled ? 'Disable' : 'Enable'} Webhook
        </button>
      </div>
      
      <div className="webhook-url">
        <label>Webhook URL:</label>
        <input 
          type="text" 
          value={webhookConfig.url}
          onChange={(e) => updateWebhookConfig({ url: e.target.value })}
        />
      </div>
      
      <div className="webhook-actions">
        <button onClick={handleTestWebhook} className="test-btn">
          Send Test Webhook
        </button>
        
        <button onClick={() => triggerTestWebhook('BTCUSD')} className="test-btn">
          Test BTC Signal
        </button>
      </div>
      
      <div className="sources">
        <h4>Allowed Sources:</h4>
        {['metatrader', 'tradingview', 'python_bot', 'custom'].map(source => (
          <label key={source}>
            <input
              type="checkbox"
              checked={webhookConfig.sources.includes(source as any)}
              onChange={(e) => {
                const newSources = e.target.checked
                  ? [...webhookConfig.sources, source]
                  : webhookConfig.sources.filter(s => s !== source);
                updateWebhookConfig({ sources: newSources });
              }}
            />
            {source}
          </label>
        ))}
      </div>
    </div>
  );
};
