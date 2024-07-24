import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormControlName } from '@angular/forms';

@Component({
  selector: 'shared-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss'
})
export class RichTextEditorComponent implements OnInit {
    quillConfig = QuillConfiguration;
    @Input() control!: FormControl
    @Input() controlName!: string
    @Input() placeholder!: string

    ngOnInit(): void {
      this.control = this.control ?? new FormControl()
    }
}

export const QuillConfiguration = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    ['link'],
    ['clean'],
  ],
}