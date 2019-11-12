// ..........navigation progress



myCursor = document.getElementById("myCursor");


competences = document.getElementById("competences");
webDev = document.getElementById("webDev");
graphisme = document.getElementById("graphisme");
design = document.getElementById("design");
softSkills = document.getElementById("softSkills");
formation = document.getElementById("formation");
Passions = document.getElementById("Passions");
realisations = document.getElementById("realisations");
realisationWeb = document.getElementById("realisationWeb");
realisationGraphisme = document.getElementById("realisationGraphisme");
realisationDesign = document.getElementById("realisationDesign");
realisationOther = document.getElementById("realisationOther");
contact = document.getElementById("contact");


competencesNav = document.getElementById("competencesNav");
webDevNav = document.getElementById("webDevNav");
graphismeNav = document.getElementById("graphismeNav");
designNav = document.getElementById("designNav");
softSkillsNav = document.getElementById("softSkillsNav");
formationNav = document.getElementById("formationNav");
PassionsNav = document.getElementById("PassionsNav");
realisationsNav = document.getElementById("realisationsNav");
realisationWebNav = document.getElementById("realisationWebNav");
realisationGraphismeNav = document.getElementById("realisationGraphismeNav");
realisationDesignNav = document.getElementById("realisationDesignNav");
realisationOtherNav = document.getElementById("realisationOtherNav");
contacNavt = document.getElementById("contactNav");


competencesTop = competences.offsetTop
webDevTop = webDev.offsetTop
graphismeTop = graphisme.offsetTop
designTop = design.offsetTop
softSkillsTop = softSkills.offsetTop
formationTop = formation.offsetTop
PassionsTop = Passions.offsetTop
realisationsTop = realisations.offsetTop
realisationWebTop = realisationWeb.offsetTop
realisationGraphismeTop = realisationGraphisme.offsetTop
realisationDesignTop = realisationDesign.offsetTop
realisationOtherTop = realisationOther.offsetTop
contactTop = contact.offsetTop



competencesNavTop = competencesNav.offsetTop
webDevNavTop = webDevNav.offsetTop
graphismeNavTop = graphismeNav.offsetTop
designNavTop = designNav.offsetTop
softSkillsNavTop = softSkillsNav.offsetTop
formationNavTop = formationNav.offsetTop
PassionsNavTop = PassionsNav.offsetTop
realisationsNavTop = realisationsNav.offsetTop
realisationWebNavTop = realisationWebNav.offsetTop
realisationGraphismeNavTop = realisationGraphismeNav.offsetTop
realisationDesignNavTop = realisationDesignNav.offsetTop
realisationOtherNavTop = realisationOtherNav.offsetTop
contactNavTop = contactNav.offsetTop


function updatePosition(){
  competencesTop = competences.offsetTop
  webDevTop = webDev.offsetTop
  graphismeTop = graphisme.offsetTop
  designTop = design.offsetTop
  softSkillsTop = softSkills.offsetTop
  formationTop = formation.offsetTop
  PassionsTop = Passions.offsetTop
  realisationsTop = realisations.offsetTop
  realisationWebTop = realisationWeb.offsetTop
  realisationGraphismeTop = realisationGraphisme.offsetTop
  realisationDesignTop = realisationDesign.offsetTop
  realisationOtherTop = realisationOther.offsetTop
  contactTop = contact.offsetTop

  competencesNavTop = competencesNav.offsetTop
  webDevNavTop = webDevNav.offsetTop
  graphismeNavTop = graphismeNav.offsetTop
  designNavTop = designNav.offsetTop
  softSkillsNavTop = softSkillsNav.offsetTop
  formationNavTop = formationNav.offsetTop
  PassionsNavTop = PassionsNav.offsetTop
  realisationsNavTop = realisationsNav.offsetTop
  realisationWebNavTop = realisationWebNav.offsetTop
  realisationGraphismeNavTop = realisationGraphismeNav.offsetTop
  realisationDesignNavTop = realisationDesignNav.offsetTop
  realisationOtherNavTop = realisationOtherNav.offsetTop
  contactNavTop = contactNav.offsetTop

  
}




console.log(competencesTop)
console.log(webDevTop)
console.log(graphismeTop)
console.log(designTop)
console.log(softSkillsTop)
console.log(formationTop)
console.log(PassionsTop)
console.log(realisationsTop)
console.log(realisationWebTop)
console.log(realisationGraphismeTop)
console.log(realisationDesignTop)
console.log(realisationOtherTop)
console.log(contactTop)


//...........Variables statements.............





function menuPosition(){
  scrollH = window.scrollY+50;
  console.log(scrollH)
  if(scrollH<webDevTop){
    myCursor.style.top= `${competencesNavTop}px`;
  }
  if(scrollH>=webDevTop && scrollH<graphismeTop){
    myCursor.style.top=`${webDevNavTop}px`; 
  }
  if(scrollH>=graphismeTop && scrollH<designTop){
    myCursor.style.top=`${graphismeNavTop}px`; 
  }
  if(scrollH>=designTop && scrollH<softSkillsTop){
    myCursor.style.top=`${designNavTop}px`; 
  }
  if(scrollH>=softSkillsTop && scrollH<formationTop){
    myCursor.style.top=`${softSkillsNavTop}px`; 
  }

  if(scrollH>=formationTop && scrollH<PassionsTop){
    myCursor.style.top=`${formationNavTop}px`; 
  }
  if(scrollH>=PassionsTop && scrollH<realisationsTop){

    myCursor.style.top=`${PassionsNavTop}px`; 
  }
  if(scrollH>=realisationsTop && scrollH<realisationWebTop){
    myCursor.style.top=`${realisationsNavTop}px`; 
  }
  if(scrollH>=realisationWebTop && scrollH<realisationGraphismeTop){
    myCursor.style.top=`${realisationWebNavTop}px`; 
  }
  if(scrollH>=realisationGraphismeTop && scrollH<realisationDesignTop){
    myCursor.style.top=`${realisationGraphismeNavTop}px`; 
  }

  if(scrollH>=realisationDesignTop && scrollH<realisationOtherTop){
    myCursor.style.top=`${realisationDesignNavTop}px`; 
  }

  if(scrollH>=realisationOtherTop && scrollH<contactTop){
    myCursor.style.top=`${realisationOtherNavTop}px`; 
  }

  if(scrollH>=contactTop){
    myCursor.style.top=`${contactNavTop}px`; 
  }


}


// ................................	positioning................................
function refreshPosition(){
  sideBarWidth= sideBar.offsetWidth;

  animatedTattooTop=animatedTattoo.offsetTop;
animatedTattooWidth= animatedTattoo.offsetWidth;
animatedTattoo.style.height=animatedTattooWidth;
// playIcon.style.top=animatedTattooTop+(animatedTattooWidth/2)-playIcon.offsetWidth/2
// playIcon.style.left=animatedTattoo.offsetLeft+animatedTattooWidth/2-playIcon.offsetWidth/2

  
}


function onResize(){
  updatePosition();
  refreshPosition();
  traceTimeline()
  menuPosition();
}
window.onresize = onResize;


function onScroll(){
  updatePosition();
  menuPosition();
  myScrollTop = window.scrollY
}
window.onscroll = onScroll;

