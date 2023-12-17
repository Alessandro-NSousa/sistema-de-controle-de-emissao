import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ProcessoFormService } from './processo-form.service';
import { ProcessoService } from '../service/processo.service';
import { IProcesso } from '../processo.model';
import { ITurma } from 'app/entities/turma/turma.model';
import { TurmaService } from 'app/entities/turma/service/turma.service';
import { IEntregaDiploma } from 'app/entities/entrega-diploma/entrega-diploma.model';
import { EntregaDiplomaService } from 'app/entities/entrega-diploma/service/entrega-diploma.service';

import { ProcessoUpdateComponent } from './processo-update.component';

describe('Processo Management Update Component', () => {
  let comp: ProcessoUpdateComponent;
  let fixture: ComponentFixture<ProcessoUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let processoFormService: ProcessoFormService;
  let processoService: ProcessoService;
  let turmaService: TurmaService;
  let entregaDiplomaService: EntregaDiplomaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ProcessoUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ProcessoUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ProcessoUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    processoFormService = TestBed.inject(ProcessoFormService);
    processoService = TestBed.inject(ProcessoService);
    turmaService = TestBed.inject(TurmaService);
    entregaDiplomaService = TestBed.inject(EntregaDiplomaService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Turma query and add missing value', () => {
      const processo: IProcesso = { id: 456 };
      const turma: ITurma = { id: 48560 };
      processo.turma = turma;

      const turmaCollection: ITurma[] = [{ id: 55503 }];
      jest.spyOn(turmaService, 'query').mockReturnValue(of(new HttpResponse({ body: turmaCollection })));
      const additionalTurmas = [turma];
      const expectedCollection: ITurma[] = [...additionalTurmas, ...turmaCollection];
      jest.spyOn(turmaService, 'addTurmaToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ processo });
      comp.ngOnInit();

      expect(turmaService.query).toHaveBeenCalled();
      expect(turmaService.addTurmaToCollectionIfMissing).toHaveBeenCalledWith(
        turmaCollection,
        ...additionalTurmas.map(expect.objectContaining)
      );
      expect(comp.turmasSharedCollection).toEqual(expectedCollection);
    });

    it('Should call EntregaDiploma query and add missing value', () => {
      const processo: IProcesso = { id: 456 };
      const entregaDiploma: IEntregaDiploma = { id: 17204 };
      processo.entregaDiploma = entregaDiploma;

      const entregaDiplomaCollection: IEntregaDiploma[] = [{ id: 57939 }];
      jest.spyOn(entregaDiplomaService, 'query').mockReturnValue(of(new HttpResponse({ body: entregaDiplomaCollection })));
      const additionalEntregaDiplomas = [entregaDiploma];
      const expectedCollection: IEntregaDiploma[] = [...additionalEntregaDiplomas, ...entregaDiplomaCollection];
      jest.spyOn(entregaDiplomaService, 'addEntregaDiplomaToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ processo });
      comp.ngOnInit();

      expect(entregaDiplomaService.query).toHaveBeenCalled();
      expect(entregaDiplomaService.addEntregaDiplomaToCollectionIfMissing).toHaveBeenCalledWith(
        entregaDiplomaCollection,
        ...additionalEntregaDiplomas.map(expect.objectContaining)
      );
      expect(comp.entregaDiplomasSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const processo: IProcesso = { id: 456 };
      const turma: ITurma = { id: 45553 };
      processo.turma = turma;
      const entregaDiploma: IEntregaDiploma = { id: 53150 };
      processo.entregaDiploma = entregaDiploma;

      activatedRoute.data = of({ processo });
      comp.ngOnInit();

      expect(comp.turmasSharedCollection).toContain(turma);
      expect(comp.entregaDiplomasSharedCollection).toContain(entregaDiploma);
      expect(comp.processo).toEqual(processo);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProcesso>>();
      const processo = { id: 123 };
      jest.spyOn(processoFormService, 'getProcesso').mockReturnValue(processo);
      jest.spyOn(processoService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ processo });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: processo }));
      saveSubject.complete();

      // THEN
      expect(processoFormService.getProcesso).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(processoService.update).toHaveBeenCalledWith(expect.objectContaining(processo));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProcesso>>();
      const processo = { id: 123 };
      jest.spyOn(processoFormService, 'getProcesso').mockReturnValue({ id: null });
      jest.spyOn(processoService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ processo: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: processo }));
      saveSubject.complete();

      // THEN
      expect(processoFormService.getProcesso).toHaveBeenCalled();
      expect(processoService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProcesso>>();
      const processo = { id: 123 };
      jest.spyOn(processoService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ processo });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(processoService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTurma', () => {
      it('Should forward to turmaService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(turmaService, 'compareTurma');
        comp.compareTurma(entity, entity2);
        expect(turmaService.compareTurma).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareEntregaDiploma', () => {
      it('Should forward to entregaDiplomaService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(entregaDiplomaService, 'compareEntregaDiploma');
        comp.compareEntregaDiploma(entity, entity2);
        expect(entregaDiplomaService.compareEntregaDiploma).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
