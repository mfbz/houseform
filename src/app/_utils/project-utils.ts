import { Project, ProjectState } from '../_interfaces/project';

export class ProjectUtils {
	public static getProjetState(project: Project) {
		// NB: project.fundraisingDeadline is always > 0
		const now = new Date().getTime() / 1000;
		// Depending on date saved we can infer project state
		if (project.fundraisingCompletedOn === 0) return now < project.fundraisingDeadline ? 'fundraising' : 'expired';
		if (project.buildingStartedOn === 0) return 'preparing';
		if (project.buildingCompletedOn === 0) return 'started';
		return 'completed';
	}

	public static getProjetStateData(projectState: ProjectState) {
		switch (projectState) {
			case 'fundraising':
				return ['Fundraising', 'blue'];
			case 'expired':
				return ['Expired', 'red'];
			case 'preparing':
				return ['Preparing', 'pink'];
			case 'started':
				return ['Started', 'purple'];
			case 'completed':
				return ['Completed', 'green'];
		}
	}
}
