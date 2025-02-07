import { Message } from "@shared/schema";

export class LangflowClient {
  async post(endpoint: string, body: any) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const responseMessage = await response.json();
      if (!response.ok) throw new Error(responseMessage.message || `${response.status} ${response.statusText}`);
      return responseMessage;
    } catch (error) {
      console.error('Request Error:', error);
      throw error;
    }
  }

  async runFlow(flowId: string, langflowId: string, message: string): Promise<string> {
    try {
      const response = await this.post(`/api/langflow/${langflowId}/run/${flowId}`, {
        input_value: message,
        input_type: 'chat',
        output_type: 'chat',
        tweaks: {
          "ChatInput-ggtgE": {
            "sender": "User",
            "session_id": "",
            "should_store_message": true,
          },
          "ChatOutput-1iThM": {
            "sender": "Machine",
            "session_id": "",
            "should_store_message": true,
          }
        },
        stream: false
      });

      console.log('Langflow API Response:', JSON.stringify(response, null, 2));

      // Extract message from the response using the correct path
      if (response?.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
        return response.outputs[0].outputs[0].results.message.text;
      }

      if (response?.outputs?.[0]?.outputs?.[0]?.artifacts?.message) {
        return response.outputs[0].outputs[0].artifacts.message;
      }

      console.error('Unexpected response format:', response);
      throw new Error('Invalid response format from Langflow API');
    } catch (error) {
      console.error('Error running flow:', error);
      throw error instanceof Error ? error : new Error('Failed to process chat message');
    }
  }
}

export const langflowClient = new LangflowClient();