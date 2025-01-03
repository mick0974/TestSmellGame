import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Aggiunto HttpHeaders
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Assignment, Student } from '../../model/assignment/assignment.model';
import { environment } from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  private baseUrl = environment.exerciseServiceUrl + '/assignments/';

  constructor(private http: HttpClient) { }

  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'  
    });
  }

  getAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(this.baseUrl + 'get-assignments', { headers: this.getHttpHeaders() });
  }

  getAssignmentByName(name: string): Observable<Assignment | undefined> {
    return this.getAssignments().pipe(
      map(assignments => assignments.find(assignment => assignment.name === name))
    );
  }

  getAssignmentsForStudent(studentName: string): Observable<Assignment[]> {
    return this.getAssignments().pipe(
      map(assignments => assignments.filter(assignment =>
        assignment.students.some(student => student.name === studentName)
      ))
    );
  }

  getCurrentStudentForAssignment(assignmentName: string, studentName: string): Observable<Student | undefined> {
    return this.getAssignmentByName(assignmentName).pipe(
      map(assignment => {
        if (assignment) {
          return assignment.students.find(student => student.name === studentName);
        } else {
          return undefined;
        }
      })
    );
  }

  submitAssignment(
    assignmentName: string,
    studentName: string,
    productionCode: string,
    testCode: string,
    shellCode: string,
    results: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('assignmentName', assignmentName);
    formData.append('studentName', studentName);
    formData.append('productionCode', new Blob([productionCode], { type: 'text/plain' }), `${studentName}_ClassCode.java`);
    formData.append('testCode', new Blob([testCode], { type: 'text/plain' }), `${studentName}_TestCode.java`);
    formData.append('shellCode', new Blob([shellCode], { type: 'text/plain' }), `${studentName}_ShellCode.java`);
    formData.append('results', new Blob([results], { type: 'text/plain' }), `${studentName}_results.txt`);

    return this.http.post(this.baseUrl + 'submit-assignment', formData, { headers: this.getHttpHeaders() });
  }

}
