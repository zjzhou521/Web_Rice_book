import { TestBed } from '@angular/core/testing';

import { MainService } from './main.service';
import {HttpClientModule} from "@angular/common/http";
import {MainComponent} from "./main.component";
import {RouterTestingModule} from "@angular/router/testing";

import * as jsonPosts from '../../assets/testData/posts.json';
import {Post} from "./post";
import {User} from "../auth/user";
import * as jsonRegUsers from "../../assets/testData/users.json";

describe('MainService', () => {
  let service: MainService;
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
    let hour = (Math.floor(Math.random() * 24) + 1);
    let minute = (Math.floor(Math.random() * 60) + 1);
    let second = (Math.floor(Math.random() * 60) + 1);
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
    timeStamp += " ";
    if (hour < 10) {
      timeStamp += "0" + hour.toString();
    } else {
      timeStamp += hour.toString();
    }
    timeStamp += ":";
    if (minute < 10) {
      timeStamp += "0" + minute.toString();
    } else {
      timeStamp += minute.toString();
    }
    timeStamp += ":";
    if (second < 10) {
      timeStamp += "0" + second.toString();
    } else {
      timeStamp += second.toString();
    }
    posts.push(new Post(jPosts[i].id, jPosts[i].title, jPosts[i].body, timeStamp, parseInt(jPosts[i].userId)));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule]
    });
    service = TestBed.inject(MainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all articles for current logged in user (posts state is set)', () => {
    const fixture = TestBed.createComponent(MainComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.posts = posts;
    service.posts = posts;
    component.curUser = regUsers[0]; // set current user to Bret
    component.curUser.isLogged = true;
    service.sortPosts();
    component.updateFeedPosts();
    component.updateFollowingUsers();
    expect(component.posts.length).not.toBe(0);
  });

  it('should fetch subset of articles for current logged in user given search keyword (posts state is filtered)', () => {
    const fixture = TestBed.createComponent(MainComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.posts = posts;
    service.posts = posts;
    component.curUser = regUsers[0]; // set current user to Bret
    component.curUser.isLogged = true;
    service.sortPosts();
    component.updateFeedPosts();
    component.updateFollowingUsers();
    let searchText = "quia et";
    component.searchWithText(searchText);
    expect(component.searchPosts.length).toBe(3);
    let searchAuthor = "Bret";
    component.searchWithAuthor(searchAuthor);
    expect(component.searchPosts.length).toBe(10);
  });

  it('should add articles when adding a follower (posts state is larger )', () => {
    const fixture = TestBed.createComponent(MainComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.posts = posts;
    service.posts = posts;
    component.curUser = regUsers[0]; // set current user to Bret
    component.curUser.isLogged = true;
    service.sortPosts();
    component.updateFeedPosts();
    component.updateFollowingUsers();
    expect(component.followingUsers.length).toBe(3);
    let oldFeedCnt = component.feedPosts.length;
    let addUserName = "Delphine";
    component.addWithFollowName(addUserName);
    expect(component.followingUsers.length).toBe(4);
    let newFeedCnt = component.feedPosts.length;
    expect(newFeedCnt > oldFeedCnt).toBe(true);
  });

  it('should remove articles when removing a follower (posts state is smaller)', () => {
    const fixture = TestBed.createComponent(MainComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.posts = posts;
    service.posts = posts;
    component.curUser = regUsers[0]; // set current user to Bret
    component.curUser.isLogged = true;
    service.sortPosts();
    component.updateFeedPosts();
    component.updateFollowingUsers();
    let oldFeedCnt = component.feedPosts.length;
    component.unfollow(3);
    let newFeedCnt = component.feedPosts.length;
    expect(newFeedCnt < oldFeedCnt).toBe(true);
  });

  it('should change the state', () => {
    const fixture = TestBed.createComponent(MainComponent);
    const component = fixture.componentInstance;
    component.users = regUsers;
    component.posts = posts;
    service.posts = posts;
    component.curUser = regUsers[0]; // set current user to Bret
    component.curUser.isLogged = true;
    service.sortPosts();
    component.updateFeedPosts();
    component.updateFollowingUsers();
    component.createNewPost();
    component.cancelNewPost();
    component.updateStatus();
    component.addFollow();
    component.searchText();
    component.searchAuthor();
    component.fetchLocalStorage();
    component.logout();
    expect(component.curUser.isLogged).toBe(false);
  });

});
