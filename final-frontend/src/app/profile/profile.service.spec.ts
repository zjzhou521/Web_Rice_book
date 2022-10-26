import { TestBed } from '@angular/core/testing';

import { ProfileService } from './profile.service';
import {ProfileComponent} from "./profile.component";
import {HttpClientModule} from "@angular/common/http";
import {RouterTestingModule} from "@angular/router/testing";

import {User} from "../auth/user";
import * as jsonRegUsers from "../../assets/testData/users.json";
import {Post} from "../main/post";
import * as jsonPosts from "../../assets/testData/posts.json";


describe('ProfileService', () => {
  let service: ProfileService;
  let regUsers:User [] = [];
  let jsonUsers = (<any>jsonRegUsers);
  for (let i = 0; i < jsonUsers.length; i++) {
    regUsers.push(new User(jsonUsers[i].username, jsonUsers[i].address.street, jsonUsers[i].id, jsonUsers[i].name, jsonUsers[i].email, jsonUsers[i].phone, jsonUsers[i].address.zipcode, jsonUsers[i].company.catchPhrase));
  }
  let posts:Post [] = [];
  let jPosts = (<any>jsonPosts);
  for (let i = 0; i < jPosts.length; i++) {
    let timeStamp = "2020-";
    let month = (Math.floor(Math.random() * 12) + 1);
    let day = (Math.floor(Math.random() * 29) + 1);
    if (month < 10) {
      timeStamp += "0" + month.toString();
    } else {
      timeStamp += month.toString();
    }
    timeStamp += "-";
    if (day < 10) {
      timeStamp += "0" + day.toString();
    } else {
      timeStamp += day.toString();
    }
    posts.push(new Post(jPosts[i].id, jPosts[i].title, jPosts[i].body, timeStamp, parseInt(jPosts[i].userId)));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule]
    });
    service = TestBed.inject(ProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the logged in user\'s profile username', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.curUser = regUsers[2];
    component.curUser.login();
    let curUsername = "";
    for (let i = 0; i < component.users.length; i++) {
      if (component.users[i].isLogged) {
        curUsername = component.users[i].username;
        break;
      }
    }
    expect(curUsername == "Samantha").toBe(true);
  });

  it('the profile should change accordingly', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.curUser = regUsers[2];
    component.curUser.login();
    component.clearNotification();
    component.updateForm.setValue({name:"z123", email:"12@2", phone:"123-123-1234", zipcode:"12345", password:"123", password_confirm:"123"});
    component.updateInfo();
    component.updateForm.setValue({name:"123", email:"12", phone:"123", zipcode:"1234", password:"12", password_confirm:"123"});
    component.updateInfo();
    component.logout();
    expect(component.curUser.isLogged).toBe(false);
  });
});
