import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private toastController: ToastController) {
    this.requestPermission();
  }

  async requestPermission() {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleNotification() {
    console.log('Schedule button clicked');

    try {
      await LocalNotifications.createChannel({
        id: 'reminders',
        name: 'Reminders',
        importance: 5,
        sound: 'notification.wav',
        description: 'Reminder notifications',
      });

      const result = await LocalNotifications.schedule({
        notifications: [
          {
            title: '🚨 Hello!',
            body: 'This is a test local notification.',
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds from now
            channelId: 'reminders',
            smallIcon: 'ic_stat_icon_config_sample', // must be in res/drawable/
            largeIcon: 'res://large_icon',           // must be in res/drawable/
            sound: 'notification.wav',                // must be in res/raw/
          }
        ]
      });

      console.log('Notification scheduled:', result);

      const toast = await this.toastController.create({
        message: 'Notification scheduled!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

    } catch (err: any) {
      console.error('Failed to schedule notification:', err);

      const toast = await this.toastController.create({
        message: `Notification failed: ${err.message || err}`,
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }
}
