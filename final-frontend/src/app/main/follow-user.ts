export class FollowUser {
    public username:string;
    public status:string;
    public imgUrl:string;

    constructor(username:string) {
        this.username = username;
        this.status = "";
        this.imgUrl = "";
    }

    addStatus(status:string) {
        this.status = status;
    }

    addImgUrl(imgUrl:string) {
        this.imgUrl = imgUrl;
        // this.imgUrl = "../../assets/images/profile/cat" + (Math.floor(Math.random()*3+1)).toString() + ".jpg";
    }
}
