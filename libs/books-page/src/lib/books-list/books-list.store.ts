import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BooksPageActions } from '@book-co/books-page/actions';
import {
  BookModel,
  BookSortOrder,
  BookSortProp,
  sortBooks,
} from '@book-co/shared-models';
import { selectAllBooks } from '@book-co/shared-state-books';

interface State {
  sortOrder: BookSortOrder;
  sortProp: BookSortProp;
  isOnSmallDevice: boolean;
}

@Injectable()
export class BooksListStore extends ComponentStore<State> {
  sortOrder$ = this.select((state) => state.sortOrder);
  sortProp$ = this.select((state) => state.sortProp);
  sortedBooks$ = this.select(
    this.sortOrder$,
    this.sortProp$,
    this.store.select(selectAllBooks),
    (sortOrder, sortProp, books) => sortBooks(sortOrder, sortProp, books)
  );
  isOnSmallDevice$ = this.select((state) => state.isOnSmallDevice);

  constructor(readonly store: Store, breakpointObserver: BreakpointObserver) {
    super({
      sortOrder: 'asc',
      sortProp: 'name',
      isOnSmallDevice: false,
    });

    this.observeLayoutChanges(
      breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
    );
  }

  setSortOrder(sortOrder: BookSortOrder) {
    this.patchState({ sortOrder });
  }

  setSortProp(sortProp: BookSortProp) {
    this.patchState({ sortProp });
  }

  onSelectBook(book: BookModel) {
    this.store.dispatch(BooksPageActions.selectBook({ bookId: book.id }));
  }

  onDeleteBook(book: BookModel) {
    this.store.dispatch(BooksPageActions.deleteBook({ bookId: book.id }));
  }

  observeLayoutChanges = this.effect(
    (breakpointState: Observable<BreakpointState>) => {
      return breakpointState.pipe(
        map((state) => state.matches),
        tap((isOnSmallDevice) => this.patchState({ isOnSmallDevice }))
      );
    }
  );
}
