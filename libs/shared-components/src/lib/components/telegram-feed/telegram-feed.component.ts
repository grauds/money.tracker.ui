import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

interface TelegramPost {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
}

interface RssResponse {
  items: TelegramPost[];
}

@Component({
  selector: 'lib-telegram-feed',
  imports: [DatePipe],
  templateUrl: './telegram-feed.component.html',
  styleUrl: './telegram-feed.component.sass',
})
export class TelegramFeedComponent implements OnInit {

  private http = inject(HttpClient);
  private channelName = 'producttoday';
  private apiUrl
    = `https://rsshub.app/telegram/channel/${this.channelName}?format=json`;

  posts: TelegramPost[] = [];
  isLoading = true;
  error = '';

  ngOnInit() {
    this.http.get<RssResponse>(this.apiUrl).subscribe({
      next: (data) => {
        this.posts = data.items || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = JSON.stringify(err);
        this.isLoading = false;
      },
    });
  }
}
