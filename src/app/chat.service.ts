import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // ✅ Works in standalone mode, no NgModule needed
})
export class ChatService {
  // 🔹 Change this to your deployed Flask backend URL on Render when ready
  private baseUrl = 'http://127.0.0.1:5000'; 

  constructor(private http: HttpClient) {}

  /** Get chat history and theme from backend */
  getHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/history`);
  }

  /** Send a message to the chatbot */
  sendMessage(message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/chat`, { message });
  }

  /** Change chatbot theme (Light, Dark, Auto) */
  setTheme(theme: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/theme`, { theme });
  }

  clearHistory() {
  return this.http.post<{ message: string }>(`${this.baseUrl}/clear`, {});
}

}
