import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin-service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { TeamDetailComponent } from '../team-detail/team-detail';
import { FormTeamModalComponent } from '../form-team-modal/form-team-modal';


@Component({
  selector: 'app-admin-team',
  imports: [CommonModule, FormsModule, TeamDetailComponent, FormTeamModalComponent],
  templateUrl: './admin-team.html',
  styleUrls: ['./admin-team.css']
})
export class AdminTeamComponent implements OnInit {

  teams: any[] = [];
  filteredTeams: any[] = [];
  loading = true;
  searchTerm = '';
  selectedTeam: any = null;
  showTeamDetail = false;
  showCreateModal = false;

  ngOnInit(): void {
    this.loadTeams();
  }

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  loadTeams() {
    this.loading = true;
    this.adminService.getAllTeams().subscribe({
      next: (res: any) => {
        this.teams = res.teams || [];
        this.filteredTeams = this.teams;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.teams = [];
        this.filteredTeams = [];
        this.loading = false;
      }
    });
  }

  filterTeams() {
    if (!this.searchTerm.trim()) {
      this.filteredTeams = this.teams;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredTeams = this.teams.filter(t =>
      t.team_name.toLowerCase().includes(term) ||
      t.owner_name?.toLowerCase().includes(term)
    );
  }

  openTeamDetail(team: any) {
    this.selectedTeam = team;
    this.showTeamDetail = true;
  }

  closeTeamDetail() {
    this.selectedTeam = null;
    this.showTeamDetail = false;
  }

  onTeamUpdated() {
    this.loadTeams();
    this.closeTeamDetail();
  }
}
