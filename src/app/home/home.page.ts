import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ToastController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Needed for pipes like date
import { Capacitor } from '@capacitor/core';

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
  lastScheduledDate: Date | null = null;
  combinedDateTime: any;
  combinedDateTime1: any;

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

//   async scheduleNotification() {
//   if (!this.message || !this.selectedDate || !this.selectedTime) {
//     this.showToast('Please provide all inputs', 'danger');
//     return;
//   }

//   // Combine and parse the datetime
//   const combinedDateTime = new Date(`${this.selectedDate}T${this.selectedTime}`);

//   // Store it so we can show it in HTML
//   this.lastScheduledDate = combinedDateTime;

//   if (isNaN(combinedDateTime.getTime())) {
//     this.showToast('Invalid date/time format', 'danger');
//     return;
//   }

//   if (combinedDateTime <= new Date()) {
//     this.showToast('Date/time must be in the future', 'danger');
//     return;
//   }

//   const id = Math.floor(Math.random() * 100000);
//   const isAndroid = Capacitor.getPlatform() === 'android';

//   try {
//     await LocalNotifications.createChannel({
//       id: 'reminders',
//       name: 'Reminders',
//       importance: 5,
//       sound: 'notification.wav',
//     });

//     await LocalNotifications.schedule({
//       notifications: [
//         {
//           title: 'Reminder',
//           body: this.message,
//           id,
//           schedule: { at: combinedDateTime },
//           channelId: isAndroid ? 'reminders' : undefined,
//           sound: 'notification.wav',
//           smallIcon: isAndroid ? 'ic_stat_icon_config_sample' : undefined,
//           largeIcon: isAndroid ? 'res://large_icon' : undefined,
//         },
//       ],
//     });

//     this.showToast('Notification scheduled!', 'success');
//     this.message = '';
//     this.selectedDate = '';
//     this.selectedTime = '';
//     this.loadPendingNotifications();
//   } catch (err) {
//     console.error('❌ Notification error:', err);
//     this.showToast('Notification failed: ' + JSON.stringify(err), 'danger');
//   }
// }


async scheduleNotification() {
  if (!this.message || !this.selectedDate || !this.selectedTime) {
    this.showToast('Please provide all inputs', 'danger');
    return;
  }

  this.combinedDateTime = new Date(`${this.selectedDate}T${this.selectedTime}`);

  const datePart = this.selectedDate.split('T')[0]; // e.g., "2025-07-23"
  this.combinedDateTime1 = new Date(`${datePart}T${this.selectedTime}`);



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
    console.error('❌ Notification error:', err);
    this.showToast('Notification failed: ' + JSON.stringify(err), 'danger');
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