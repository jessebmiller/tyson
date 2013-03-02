Template.contentList.renderContent = function () {
    console.log(this);
    return Template[this.type](this);
}

