# NGX API Client

A powerful, reusable, and standardized Angular service layer for making API requests. This library provides a `BaseCrudService` that standardizes all common data operations (CRUD, pagination, filtering) and offers centralized error and authorization handling.

---

### Features

- **Standardized CRUD:** Provides a `BaseCrudService` with ready-to-use methods like `findAll`, `findById`, `create`, `updateById`, `deleteById`, and more.
- **Type-Safe:** Fully generic to work with your specific entity types and DTOs.
- **Global Event Handling:** Emits static observables (`error$` and `unauthorized$`) from a base service, allowing your application to handle all API errors and 401 responses from a single location.
- **Powerful Pagination:** Includes a `SearchRequestManager` class to easily handle server-side pagination, sorting, and filtering state.
- **Configurable:** Easily configure the base API URL for different environments.

---

### Installation

To install the library, run the following command in your Angular project:

```bash
npm install ngx-api-client
```

> **Note:** Replace `ngx-api-client` with your actual package name if you published it under a different one.

---

### Setup and Configuration

You must import and configure the library in your root application module (e.g., `app.module.ts`).

#### 1. Import the Module

Use the `forRoot()` static method to provide the base URL for your API.

```typescript
// src/app/app.module.ts

import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { NgxApiClientModule } from "ngx-api-client";
import { environment } from "../environments/environment"; // Your environment file

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    // Configure the library with your backend URL
    NgxApiClientModule.forRoot(environment.apiUrl),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

#### 2. Handle Global Events (Recommended)

In your main component (e.g., `app.component.ts`), you can subscribe to the static observables to handle errors and logouts globally.

```typescript
// src/app/app.component.ts

import { Component, OnInit, inject } from "@angular/core";
import { BaseApiService } from "ngx-api-client";
// Import your own services for Toast notifications or State Management
// import { ToastService } from './services/toast.service';
// import { Store } from '@ngxs/store';
// import { LogoutAction } from './store/auth.actions';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  // private toast = inject(ToastService);
  // private store = inject(Store);

  ngOnInit() {
    BaseApiService.unauthorized$.subscribe(() => {
      console.error("Unauthorized! User should be logged out.");
      // this.store.dispatch(new LogoutAction());
    });

    BaseApiService.error$.subscribe((errorMessage) => {
      console.error("An API error occurred:", errorMessage);
      // this.toast.error(errorMessage);
    });
  }
}
```

---

### Usage

#### 1. Create a Specific Service

Create a new service for your application's entities (e.g., Users, Products) by extending `BaseCrudService`.

```typescript
// src/app/services/users.service.ts

import { Injectable, inject } from "@angular/core";
import { BaseCrudService, API_URL } from "ngx-api-client";

// Define your DTOs and Entity types
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface CreateUserDTO {
  name: string;
  email: string;
}
export interface UpdateUserDTO {
  name?: string;
}

@Injectable({
  providedIn: "root",
})
export class UsersService extends BaseCrudService<User, CreateUserDTO, UpdateUserDTO> {
  constructor() {
    // The API_URL is injected into the parent class.
    // The second argument is the controller's route prefix.
    super(inject(API_URL), "/users");
  }
}
```

#### 2. Using the Service for Basic CRUD

Inject your new service into any component and use its methods.

```typescript
import { Component, OnInit, inject } from "@angular/core";
import { UsersService } from "./services/users.service";

@Component({
  /* ... */
})
export class MyComponent implements OnInit {
  private usersService = inject(UsersService);

  ngOnInit() {
    // Get a single user
    this.usersService.findById("123").subscribe((user) => {
      console.log("Found user:", user);
    });

    // Create a new user
    const newUser = { name: "Jane Doe", email: "jane.doe@example.com" };
    this.usersService.create(newUser).subscribe((createdUser) => {
      console.log("Created user:", createdUser);
    });
  }
}
```

#### 3. Using the Service for Pagination

The `SearchRequestManager` class helps manage the state for paginated data grids.

```typescript
import { Component, OnInit, inject } from "@angular/core";
import { UsersService, User } from "./services/users.service";
import { SearchRequestManager, SearchRequestResponse } from "ngx-api-client";

@Component({
  /* ... */
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);

  public searchManager: SearchRequestManager;
  public paginatedUsers$: Observable<SearchRequestResponse<User>>;

  constructor() {
    // 1. Instantiate the manager, passing it the service method to call
    this.searchManager = new SearchRequestManager((request) => this.usersService.findByPagination(request));

    // 2. Get the observable for the component template
    this.paginatedUsers$ = this.searchManager.loadData();
  }

  ngOnInit() {
    // Initial data is loaded automatically by the constructor.
    // To reload the data at any time:
    this.searchManager.reload();
  }
}
```

### API Reference

- **`NgxApiClientModule.forRoot(apiUrl: string)`**: The main module to be imported.
- **`BaseCrudService<T, CreateDTO, UpdateDTO>`**: The base class to extend for your services.
- **`BaseApiService`**: The underlying service. Contains the static event emitters `error$` and `unauthorized$`.
- **`SearchRequestManager`**: A helper class for managing server-side pagination state.

---

### License

This project is licensed under the MIT License.
