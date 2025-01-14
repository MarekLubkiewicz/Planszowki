import { TestBed } from '@angular/core/testing';

import { GryService } from './gry.service';

describe('GryService', () => {
  let service: GryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
