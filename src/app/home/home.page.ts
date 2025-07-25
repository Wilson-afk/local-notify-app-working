import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ToastController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scheduled: any[] = [];
  message = '';
  selectedDate: string = '';
  selectedTime: string = '';
  combinedDateTime: Date | null = null;

  constructor(private toastController: ToastController) {
    this.requestPermission();
    this.loadPendingNotifications();

    // Auto-refresh every 60 seconds
    setInterval(() => {
      this.loadPendingNotifications();
    }, 60000); // 60000ms = 1 minute
  }

  async requestPermission() {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleNotification() {
    if (!this.message || !this.selectedDate || !this.selectedTime) {
      this.showToast('Please provide all inputs', 'danger');
      return;
    }

    // Safely combine date and time
    const datePart = this.selectedDate.split('T')[0]; // YYYY-MM-DD
    const timePart = this.selectedTime.includes('T')
      ? this.selectedTime.split('T')[1].substring(0, 5)
      : this.selectedTime; // HH:mm

    const [hours, minutes] = timePart.split(':').map(Number);
    const combined = new Date(datePart);
    combined.setHours(hours, minutes, 0, 0);
    this.combinedDateTime = combined;

    console.log('Combined DateTime:', this.combinedDateTime);
    console.log('Now:', new Date());

    if (this.combinedDateTime <= new Date()) {
      this.showToast('Date/time must be in the future', 'danger');
      return;
    }

    const id = Math.floor(Math.random() * 100000);
    const isAndroid = Capacitor.getPlatform() === 'android';

    try {
      await LocalNotifications.createChannel({
        id: 'reminders',
        name: 'Reminders',
        importance: 5,
        sound: 'notification.wav',
      });

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Reminder',
            body: this.message,
            id,
            schedule: { at: this.combinedDateTime },
            channelId: isAndroid ? 'reminders' : undefined,
            sound: 'notification.wav',
            smallIcon: isAndroid ? 'ic_stat_icon_config_sample' : undefined,
            largeIcon: isAndroid ? 'res://large_icon' : undefined,
          },
        ],
      });

      this.showToast('Notification scheduled!', 'success');
      this.message = '';
      this.selectedDate = '';
      this.selectedTime = '';
      this.loadPendingNotifications();
    } catch (err) {
      console.error('Notification error:', err);
      this.showToast('Notification failed: ' + JSON.stringify(err), 'danger');
    }
  }

  async loadPendingNotifications() {
    const result = await LocalNotifications.getPending();
    const now = new Date();

    this.scheduled = result.notifications
      .filter(n => n.schedule?.at && new Date(n.schedule.at).getTime() > now.getTime())
      .sort((a, b) => {
        const aTime = a.schedule?.at ? new Date(a.schedule.at).getTime() : Infinity;
        const bTime = b.schedule?.at ? new Date(b.schedule.at).getTime() : Infinity;
        return aTime - bTime;
      });
  }

  getTimeRemaining(date: string | Date): string {
    const now = new Date().getTime();
    const target = new Date(date).getTime();
    const diffMs = target - now;

    if (diffMs <= 0) return 'Triggered';

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  }

  async cancelNotification(id: number) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    this.showToast('Notification canceled', 'medium');
    this.loadPendingNotifications();
  }

  async showToast(msg: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}






