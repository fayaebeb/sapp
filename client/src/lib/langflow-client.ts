import { Message } from "@shared/schema";

export class LangflowClient {
  constructor(private baseURL: string, private applicationToken: string) {}

  async post(endpoint: string, body: any, headers: Record<string, string> = { "Content-Type": "application/json" }) {
    headers["Authorization"] = `Bearer ${this.applicationToken}`;
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });
      const responseMessage = await response.json();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
      return responseMessage;
    } catch (error) {
      console.error('Request Error:', error);
      throw error;
    }
  }

  async runFlow(flowId: string, langflowId: string, message: string) {
    try {
      const response = await this.post(`/lf/${langflowId}/api/v1/run/${flowId}`, {
        input_value: message,
        input_type: 'chat',
        output_type: 'chat',
        stream: false
      });

      if (response?.outputs?.[0]?.outputs?.[0]?.message?.text) {
        return response.outputs[0].outputs[0].message.text;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error running flow:', error);
      throw error;
    }
  }
}

// Use Vite's environment variable syntax
export const langflowClient = new LangflowClient(
  'https://api.langflow.astra.datastax.com',
  import.meta.env.VITE_LANGFLOW_TOKEN || ''
);