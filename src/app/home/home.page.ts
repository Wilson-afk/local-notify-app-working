import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ToastController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Needed for pipes like date

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Include CommonModule
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scheduled: any[] = [];
  message = '';
  selectedDate: string = '';
  selectedTime: string = '';

  constructor(private toastController: ToastController) {
    this.requestPermission();
    this.loadPendingNotifications();
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

    const combinedDateTime = new Date(`${this.selectedDate}T${this.selectedTime}`);
    const id = Date.now();

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
            schedule: { at: combinedDateTime },
            channelId: 'reminders',
            sound: 'notification.wav',
            smallIcon: 'ic_stat_icon_config_sample',
            largeIcon: 'res://large_icon',
          },
        ],
      });

      this.showToast('Notification scheduled!', 'success');
      this.message = '';
      this.selectedDate = '';
      this.selectedTime = '';
      this.loadPendingNotifications();
    } catch (err) {
      console.error('Failed to schedule:', err);
      this.showToast('Failed to schedule notification', 'danger');
    }
  }

  async loadPendingNotifications() {
    const result = await LocalNotifications.getPending();
    this.scheduled = result.notifications;
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
