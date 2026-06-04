import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../profile';
import { Profile } from '../../profile.model';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css']
})
export class Parametres {
  
  private profileService = inject(ProfileService);
  imageError: boolean = false;
  
  // Copie locale pour le formulaire (évite de modifier le signal en direct)
  form: Profile = { ...this.profileService.myProfile() };

  saveSettings() {
    this.profileService.updateProfile(this.form);
    alert('Profil mis à jour avec succès !');
  }
}