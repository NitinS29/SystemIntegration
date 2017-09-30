import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, DataTable, LazyLoadEvent, DialogModule } from "primeng/primeng";
import Dexie from 'dexie';
import { Observable } from "rxjs";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
const MAX_EXAMPLE_RECORDS = 1000;

@Component({
  selector: 'at-alltimes',
  templateUrl: './alltimes.component.html',
  styleUrls: ['./alltimes.component.css']
})
export class AlltimesComponent implements OnInit {

  @ViewChild("dt") dt : DataTable;

  allTimesheetData = [];
  showModal = false;
  addTime : FormGroup;

  allProjectNames = ['', 'Payroll App', 'Mobile App', 'Agile Times'];

  allProjects = this.allProjectNames.map((proj) => {
    return { label: proj, value: proj }
  });

  selectedRows: Array<any>;

  contextMenu: MenuItem[];

  recordCount : number;

  
  //constructor(private apollo: Apollo) { }
  constructor(private apollo: Apollo, private formBuilder:FormBuilder) { }
  //queryObservable : any;

  ngOnInit() {
    this.addTime=this.formBuilder.group({
      User : ['',[Validators.required]],
      Project : ['',[Validators.required]],
      Category : ['',[Validators.required]],
      StartTime : ['',[Validators.required]],
      EndTime : ['',[Validators.required]],
    })

    const AllClientsQuery = gql`
    query allTimesheets {
      allTimesheets {
          id
          user
          project
          category
          startTime
          endTime
        }
    }`;

    const queryObservable = this.apollo.watchQuery({

      query: AllClientsQuery,
      pollInterval:400
      
          }).subscribe(({ data, loading }: any) => {
      
            this.allTimesheetData = data.allTimesheets;
            this.recordCount = data.allTimesheets.length;
      
          });
      
    }
      
        onEditComplete(editInfo) { }

        onAddTimesheetClicked(){
          const user = this.addTime.value.User;
          const proj = this.addTime.value.Project;
          const catg = this.addTime.value.Category;
          const sTime = this.addTime.value.StartTime;
          const eTime = this.addTime.value.EndTime;
          //console.log("values :" +this.addTime.value + "2-"+this.addTime.value.Project +"3-"+ user+ category + startTime + endTime);
          

          const createTimesheet = gql`
          mutation createTimesheet ($user: String!, $project: String!, $category: String!, $startTime: Int!, $endTime: Int!, $date: DateTime!) {
            createTimesheet(user: $user, project: $project, category: $category, startTime: $startTime, endTime: $endTime, date:$date ) {
              id
            }
          }
        `;
    
        this.apollo.mutate({
          mutation: createTimesheet,
          variables: {
            user: user,
            project: proj,
            category: catg,
            startTime: sTime,
            endTime: eTime,
            date : new Date()
          }
        }).subscribe(({ data }) => {
          this.showModal = false;
          //console.log('Time entry added successfully', data);
          alert('Time entry added successfully for User: ' +this.addTime.value.User);
          
        }, (error) => {
          console.log('there was an error in adding the entry', error);
          alert('there was an error in adding the entry');
        });
        
        }

        hasFormErrors() {
          return !this.addTime.valid;
        }


}
