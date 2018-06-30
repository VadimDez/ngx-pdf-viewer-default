/**
 * Created by Vadym Yatsyuk on 30.03.18
 */

import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'pdf-viewer-default',
  templateUrl: 'pdf-viewer-default.component.html',
  styleUrls: ['pdf-viewer-default.component.scss']
})

export class PdfViewerDefaultComponent implements OnInit, OnDestroy {
  @Input() src: string;

  zoomValue = 1;
  page = 1;
  totalPages: number;
  isSearchShown = false;
  searchString: string;
  isCaseSensativeSearch = false;
  zoomType: any = 'auto';

  @ViewChild('mainElem') mainElem: ElementRef;
  @ViewChild(PdfViewerComponent) pdfComponent;
  @ViewChild('search') searchRef: ElementRef;

  private onSearchKeyupSubscription: Subscription;

  ngOnInit() {
    this.onSearchKeyupSubscription = Observable.fromEvent(this.searchRef.nativeElement, 'keyup')
      .debounceTime(300)
      .subscribe(this.onSearch.bind(this));

    if (window) {
      this.addHotKeyEvents();
    }
  }

  ngOnDestroy() {
    if (this.onSearchKeyupSubscription) {
      this.onSearchKeyupSubscription.unsubscribe();
    }
  }

  public zoom(value: number) {
    this.zoomType = 'custom';
    this.zoomValue += value;
  }

  public stepFromPage(value: number) {
    this.page += value;
  }

  public onLoadComplete(data: PDFDocumentProxy) {
    this.totalPages = data.numPages;
  }

  public toggleSearch() {
    this.isSearchShown = !this.isSearchShown;
  }

  public findAgain(findPrevious?: boolean) {
    const findState = this.pdfComponent.pdfFindController.state;

    if (findState) {
      this.pdfComponent.pdfFindController.executeCommand('findagain', {
        query: findState.query,
        phraseSearch: findState.phraseSearch,
        caseSensitive: findState.caseSensitive,
        highlightAll: findState.highlightAll,
        findPrevious: findPrevious
      });
    }
  }

  public onFileSelected() {
    const $pdf: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.src = e.target.result;
      };

      reader.readAsArrayBuffer($pdf.files[0]);
    }
  }

  public goToFullscreen() {
    const fn = this.getFullscreenFn(this.mainElem.nativeElement.parentElement);

    if (fn) {
      fn.call(this.mainElem.nativeElement.parentElement);
    }
  }

  private getFullscreenFn(elem: any) {
    return elem.requestFullScreen
    || elem.webkitRequestFullScreen
    || elem.mozRequestFullScreen
    || elem.msRequestFullscreen
  }

  private find(stringToSearch: string) {
    this.pdfComponent.pdfFindController.executeCommand('find', {
      caseSensitive: this.isCaseSensativeSearch,
      findPrevious: undefined,
      highlightAll: true,
      phraseSearch: true,
      query: stringToSearch
    });
  }

  private addHotKeyEvents() {
    window.addEventListener('keydown', this.hotKeyDown.bind(this));
  }

  private hotKeyDown(e: KeyboardEvent) {
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }

    if (e.keyCode === 70) {
      e.preventDefault();
      this.toggleSearch();
    } else if (e.keyCode === 71) {
      e.preventDefault();
      this.findAgain(e.shiftKey);
    }
  }

  private onSearch(e: KeyboardEvent) {
    const searchString = (<HTMLInputElement>e.target).value;

    if (this.searchString !== searchString) {
      this.searchString = searchString;
      this.find(this.searchString);
    } else {
      this.findAgain();
    }
  }
}
