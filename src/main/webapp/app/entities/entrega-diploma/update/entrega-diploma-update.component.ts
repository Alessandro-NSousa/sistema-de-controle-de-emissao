import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EntregaDiplomaFormService, EntregaDiplomaFormGroup } from './entrega-diploma-form.service';
import { IEntregaDiploma } from '../entrega-diploma.model';
import { EntregaDiplomaService } from '../service/entrega-diploma.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';

@Component({
  selector: 'jhi-entrega-diploma-update',
  templateUrl: './entrega-diploma-update.component.html',
})
export class EntregaDiplomaUpdateComponent implements OnInit {
  isSaving = false;
  entregaDiploma: IEntregaDiploma | null = null;

  editForm: EntregaDiplomaFormGroup = this.entregaDiplomaFormService.createEntregaDiplomaFormGroup();

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected entregaDiplomaService: EntregaDiplomaService,
    protected entregaDiplomaFormService: EntregaDiplomaFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ entregaDiploma }) => {
      this.entregaDiploma = entregaDiploma;
      if (entregaDiploma) {
        this.updateForm(entregaDiploma);
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('emissaoDiplomaApp.error', { ...err, key: 'error.file.' + err.key })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const entregaDiploma = this.entregaDiplomaFormService.getEntregaDiploma(this.editForm);
    if (entregaDiploma.id !== null) {
      this.subscribeToSaveResponse(this.entregaDiplomaService.update(entregaDiploma));
    } else {
      this.subscribeToSaveResponse(this.entregaDiplomaService.create(entregaDiploma));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEntregaDiploma>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(entregaDiploma: IEntregaDiploma): void {
    this.entregaDiploma = entregaDiploma;
    this.entregaDiplomaFormService.resetForm(this.editForm, entregaDiploma);
  }
}
