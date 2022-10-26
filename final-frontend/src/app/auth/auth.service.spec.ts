import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {HttpClientModule} from "@angular/common/http";
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {AuthComponent} from "./auth.component";

import * as jsonRegUsers from '../../assets/testData/users.json';
import {User} from "./user";

// import * as jsonRegUsers from '../../assets/testData/users.json';


describe('AuthService', () => {
  let service: AuthService;
  let regUsers:User [] = [];
  let jsonUsers = (<any>jsonRegUsers);
  for (let i = 0; i < jsonUsers.length; i++) {
    regUsers.push(new User(jsonUsers[i].username, jsonUsers[i].address.street, jsonUsers[i].id, jsonUsers[i].name, jsonUsers[i].email, jsonUsers[i].phone, jsonUsers[i].address.zipcode, jsonUsers[i].company.catchPhrase));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule, ReactiveFormsModule, FormsModule]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not log in an invalid user (error state should be set)', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    let testUserName = "Bret";
    let testPassword = "wrongPassword";
    expect(component.login(testUserName, testPassword, component.users)).toBe(false);
    expect(component.users[0].isLogged).toBe(false);
    expect(component.isLoginError).toBe(true);
  });

  it('should log in a previously registered user (not new users, login state should be set)', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    let testUserName = "Bret";
    let testPassword = "Kulas Light";
    expect(component.login(testUserName, testPassword, component.users)).toBe(true);
    expect(component.users[0].isLogged).toBe(true);
  });

  it('should log out a user (login state should be cleared)', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    let testUserName = "Bret";
    let testPassword = "Kulas Light";
    component.login(testUserName, testPassword, component.users);
    expect(component.users[0].isLogged).toBe(true);
    component.logout(component.users);
    expect(component.users[0].isLogged).toBe(false);
  });

  it('the form should check correctness', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    let testUserName = "Bret";
    let testPassword = "Kulas Light";
    component.loginForm.setValue({log_ac_name: testUserName, log_password: testPassword});
    expect(component.checkLogin()).toBe(true);
    component.loginForm.setValue({log_ac_name: testUserName, log_password: "12"});
    expect(component.checkLogin()).toBe(false);
    component.regForm.setValue({password:"123", password_confirm:"123", birth:"1999-01-01", ac_name:"z123", dis_name:"disp!", email:"12@2", phone:"123-123-1234", zip:"12345", timestamp:"123"});
    component.checkAll();
    component.regForm.setValue({password:"123", password_confirm:"1", birth:"2020-01-01", ac_name:"123", dis_name:"disp!", email:"1", phone:"12", zip:"125", timestamp:"123"});
    expect(component.checkAll()).toBe(false);
  });






});
