import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: { role: string, content: string }[] = [];
  messageInput = '';
  botRole = '';
  theme = 'light';
  menuOpen = false;
  atBottom = true;
  private scrollTimeout: any = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getHistory().subscribe(data => {
      this.messages = data.history.map((m: any) => ({
        role: m[0],
        content: m[1]
      }));
      this.botRole = data.role;
      this.theme = data.theme.toLowerCase();
      this.applyTheme(this.theme);

      // ✅ Always start at the bottom on load
      setTimeout(() => this.scrollToBottom(), 50);

      const chatBox = document.getElementById('chat-box');
      if (chatBox) {
        chatBox.addEventListener('scroll', () => this.onScroll());
      }
    });
  }

  onScroll(): void {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const tolerance = 5;
    const atExactBottom =
      chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - tolerance;

    this.atBottom = atExactBottom;
  }

  private scrollToBottom(): void {
    if (!this.atBottom) return; // only scroll if already at bottom

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const chatBox = document.getElementById('chat-box');
      if (!chatBox) return;
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
      this.scrollTimeout = null;
    }, 50);
  }

  sendMessage(): void {
    const msg = this.messageInput.trim();
    if (!msg) return;

    // ✅ Handle /clear command
    if (msg.toLowerCase() === '/clear') {
      this.clearHistory();
      this.messageInput = '';
      return;
    }

    const shouldScroll = this.atBottom;
    this.messages.push({ role: 'user', content: msg });
    this.messageInput = '';

    if (shouldScroll) {
      setTimeout(() => this.scrollToBottom(), 50);
    }

    this.chatService.sendMessage(msg).subscribe(res => {
      const scrollCheck = this.atBottom;
      this.messages.push({ role: 'assistant', content: res.reply });
      if (scrollCheck) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  clearHistory(): void {
    this.chatService.clearHistory().subscribe({
      next: (res) => {
        console.log(res.message);
        this.messages = [];
        this.menuOpen = false;
        setTimeout(() => this.scrollToBottom(), 50); // keep bar at bottom
      },
      error: (err) => console.error('Error clearing history:', err)
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  applyTheme(theme: string): void {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
  }

  toggleTheme(): void {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';

    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    this.chatService.setTheme(newTheme).subscribe({
      next: (res) => {
        this.theme = newTheme;
        console.log(res.message);
      },
      error: (err) => console.error(err)
    });

    this.menuOpen = false;
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  showAbout = false;
showInstructions = false;

openAbout(): void {
  this.showAbout = true;
}

openInstructions(): void {
  this.showInstructions = true;
}

closeModal(): void {
  this.showAbout = false;
  this.showInstructions = false;
}
    
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu')) {
      this.menuOpen = false;
    }
  }
}
