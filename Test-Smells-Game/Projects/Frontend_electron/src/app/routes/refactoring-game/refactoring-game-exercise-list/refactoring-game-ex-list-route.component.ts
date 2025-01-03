import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ExerciseService } from 'src/app/services/exercise/exercise.service';
import { Router } from "@angular/router";
import {ElectronService} from "ngx-electron";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {FormBuilder, NgForm} from "@angular/forms";
import {environment} from "../../../../environments/environment.prod";
import { HttpClient } from '@angular/common/http';
import { ExerciseConfiguration } from 'src/app/model/exercise/ExerciseConfiguration.model';
import { UserService } from 'src/app/services/user/user.service';
import { levelConfig } from "src/app/model/levelConfiguration/level.configuration.model"
import {DatePipe} from "@angular/common";
import {GithubRetrieverComponent} from "../../../components/github-retriever/github-retriever.component";


@Component({
  selector: 'app-refactoring-game-exercise-list',
  templateUrl: './refactoring-game-ex-list-route.component.html',
  styleUrls: ['./refactoring-game-ex-list-route.component.css']
})
export class RefactoringGameExListRouteComponent implements OnInit {

  constructor(private exerciseService: ExerciseService,
              private _electronService: ElectronService,
              private userService: UserService,
              private zone: NgZone,
              private fb: FormBuilder,
              private _router: Router,
              private http: HttpClient) { }

  private config!: levelConfig;
  exercises = new Array<any>();
  exerciseConfigurations = new Array<ExerciseConfiguration>();
  serverProblems = false;
  waitingForServer!: boolean;
  enableGit = false
  gitForm: any;
  exerciseType !: number;
  @ViewChild('child') child!: GithubRetrieverComponent;

  ngOnInit(): void {
    this.exerciseType = Number(localStorage.getItem("exerciseRetrieval"));

    // GET EXERCISES LIST FROM CLOUD
    if (this.exerciseType == 2){
      this.waitingForServer = true;
      this.initExercises();
      this.exerciseService.getExercises().subscribe(response =>{
        this.waitingForServer = false;
        this.exercises = response;
      }, error => {
        this.serverProblems = true;
        this.waitingForServer = false;
      });
      // GET EXERCISES LIST FROM GIT
    } else if (this.exerciseType == 1){
      this.waitingForServer = false;
      this.initExercises();
      this.enableGetExercisesFromGit()
      this._electronService.ipcRenderer.on('getExerciseFilesFromLocal', (event, data)=>{
        this.zone.run(()=>{
          this.exercises = data;
          this.child.stopLoading()
        })
      })
    }

  }

  getConfigForExercise(exercise: string) {
    return this.exerciseConfigurations.find(config => config.exerciseId.slice(0, -2) === exercise);
  }  

  initExercises() {
    this.exerciseService.getAllConfigFiles().subscribe(
      (response: any[]) => {
        this.waitingForServer = false;
        this.exerciseConfigurations = response.map(item => JSON.parse(atob(item)));
        console.log(this.exerciseConfigurations);
      },
      error => {
        this.serverProblems = true;
        this.waitingForServer = false;
      }
    );

    this.exerciseService.getLevelConfig().subscribe(
          (data: levelConfig) => {
            this.config = data;
            console.log('LevelConfig:', this.config);
          },
          error => {
            console.error('Error fetching level config:', error);
          }
        );
  }

  isExerciseEnabled(level: number): boolean {
      if (this.userService.getUserExp() < this.config.expValues[0]) {
        return level === 1;
      } else if (this.userService.getUserExp() < this.config.expValues[1]) {
        return level <= 2;
      } else {
        return true;
      }
    }

    private enableGetExercisesFromGit() {
    this.enableGit = true
    this.gitForm = this.fb.group({
      url:"https://github.com/LZannini/Thesis-Exercises-Repository",
      branch:"exercises"
    })
  }

  prepareGetFilesFromRemote(form: NgForm){
    this.exercises = [];
    this.exerciseService.getFilesFromRemote(form.value.url, form.value.branch)
    environment.repositoryUrl = form.value.url;
    environment.repositoryBranch = form.value.branch;
  }
}
