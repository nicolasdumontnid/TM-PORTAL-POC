import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ImagesByDate, MedicalImage } from '../../../../models/visual-patient.model';

@Component({
  selector: 'app-images-preview-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './images-preview-block.component.html',
  styleUrl: './images-preview-block.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagesPreviewBlockComponent {
  @Input() imagesByDate$!: Observable<ImagesByDate[]>;
  @Output() imageClick = new EventEmitter<MedicalImage>();

  onImageClick(image: MedicalImage): void {
    this.imageClick.emit(image);
  }
}