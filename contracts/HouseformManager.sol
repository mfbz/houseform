// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@klaytn/contracts/KIP/token/KIP37/IKIP37.sol';
import '@klaytn/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './HouseformShare.sol';

contract HouseformManager is Ownable, ReentrancyGuard {
	struct Project {
		uint projectId;
		address builder;
		uint currentAmount;
		uint goalAmount;
		uint saleAmount; // Amount at which the project is sold
		uint expectedProfit; // Expected profit for investors
		uint builderFee; // The percentage of the profit for the builder
		uint currentShares;
		uint totalShares;
		uint fundraisingDeadline; // Deadline timestamp for reaching the fundraising goal
		uint fundraisingCompletedOn;
		uint buildingStartedOn;
		uint buildingCompletedOn;
	}

	// The main multitoken contract that handles shares
	HouseformShare public shareContract;
	// The list of all projects
	Project[] public projects;
	// The mapping from builder to projects to easily retrieve them
	mapping(address => uint[]) public builderToProjects;
	// Used to check if builder fee has been already redeemed
	mapping(uint => bool) public projectToFeeRedeemed;

	event ProjectCreated(
		uint _projectId,
		string _name,
		string _description,
		string _image,
		uint _goalAmount,
		uint _expectedProfit,
		uint _builderFee,
		uint _totalShares,
		uint _fundraisingDeadline
	);
	event BuildingStarted(uint _projectId, uint _buildingStartedOn);
	event BuildingCompleted(uint _projectId, uint _buildingCompletedOn, uint _saleAmount);
	event SharesBought(address _account, uint _projectId, uint _shares);
	event SharesRedeemed(address _account, uint _projectId, uint _shares);
	event FeeRedeemed(address _account, uint _projectId, uint _amountRedeemed);
	event FundraisingCompleted(uint _projectId, uint _fundraisingCompletedOn);

	modifier projectExists(uint _projectId) {
		// NB: project ids are incremental indexes of projects array
		require(_projectId >= 0 && _projectId < projects.length, 'Project does not exist');
		_;
	}

	modifier onlyBuilder(uint _projectId) {
		require(projects[_projectId].builder == msg.sender, 'Caller is not the project builder');
		_;
	}

	modifier fundraisingNotExpired(uint _projectId) {
		require(block.timestamp <= projects[_projectId].fundraisingDeadline, 'Fundraising expired');
		_;
	}

	modifier fundraisingExpired(uint _projectId) {
		require(block.timestamp > projects[_projectId].fundraisingDeadline, 'Fundraising not expired yet');
		_;
	}

	modifier fundraisingNotCompleted(uint _projectId) {
		require(projects[_projectId].fundraisingCompletedOn == 0, 'Fundraising already completed');
		_;
	}

	modifier fundraisingCompleted(uint _projectId) {
		require(projects[_projectId].fundraisingCompletedOn != 0, 'Fundraising not completed');
		_;
	}

	modifier buildingNotStarted(uint _projectId) {
		require(projects[_projectId].buildingStartedOn == 0, 'Building already started');
		_;
	}

	modifier buildingStarted(uint _projectId) {
		require(projects[_projectId].buildingStartedOn != 0, 'Building not started');
		_;
	}

	modifier buildingNotCompleted(uint _projectId) {
		require(projects[_projectId].buildingCompletedOn == 0, 'Building already completed');
		_;
	}

	modifier buildingCompleted(uint _projectId) {
		require(projects[_projectId].buildingCompletedOn != 0, 'Building not completed');
		_;
	}

	constructor() {
		// Create share contract becoming its owner due to its ownable trait
		shareContract = new HouseformShare();
	}

	function createProject(
		string memory _name,
		string memory _description,
		string memory _image,
		uint _goalAmount,
		uint _expectedProfit,
		uint _builderFee,
		uint _totalShares,
		uint _fundraisingDeadline
	) external nonReentrant {
		// Validate inputs
		require(_goalAmount > 0, 'Invalid goal amount');
		require(_builderFee >= 0 && _builderFee < 100, 'Invalid builder fee');
		require(_totalShares > 1, 'Invalid total shares');
		require(_expectedProfit >= 0, 'Invalid expected profit');
		// NB: At least x days of deadline
		require(_fundraisingDeadline >= block.timestamp + 1 days, 'Invalid fundraising deadline');

		// Get new project id that is its index in the array
		uint id = projects.length;

		// Push new project into the array saving its data in projects array storage
		projects.push(
			Project({
				projectId: id,
				builder: msg.sender,
				currentAmount: 0,
				goalAmount: _goalAmount,
				saleAmount: 0,
				expectedProfit: _expectedProfit,
				builderFee: _builderFee,
				currentShares: 0,
				totalShares: _totalShares,
				fundraisingDeadline: _fundraisingDeadline,
				fundraisingCompletedOn: 0,
				buildingStartedOn: 0,
				buildingCompletedOn: 0
			})
		);

		// Save project for builder
		builderToProjects[msg.sender].push(id);
		// Set project share metadata for id
		shareContract.setMetadata(id, _name, _description, _image);

		// Emit event
		emit ProjectCreated(
			id,
			_name,
			_description,
			_image,
			_goalAmount,
			_expectedProfit,
			_builderFee,
			_totalShares,
			_fundraisingDeadline
		);
	}

	function startBuilding(
		uint _projectId
	)
		external
		projectExists(_projectId)
		onlyBuilder(_projectId)
		fundraisingCompleted(_projectId)
		buildingNotStarted(_projectId)
		nonReentrant
	{
		Project storage project = projects[_projectId];

		// Send amount to builder
		(bool success, ) = project.builder.call{value: project.currentAmount}('');
		require(success, 'Failed to send amount');

		// Update data
		project.buildingStartedOn = block.timestamp;
		project.currentAmount = 0;

		// Emit event
		emit BuildingStarted(_projectId, project.buildingStartedOn);
	}

	function completeBuilding(
		uint _projectId
	)
		external
		payable
		projectExists(_projectId)
		onlyBuilder(_projectId)
		buildingStarted(_projectId)
		buildingNotCompleted(_projectId)
		nonReentrant
	{
		Project storage project = projects[_projectId];

		// Must have sent a valid amount
		// NB: We could add a variable that manages the min value the builder can garantee
		require(msg.value > 0, 'Invalid sale amount');

		// Update data
		project.buildingCompletedOn = block.timestamp;
		project.currentAmount = msg.value;
		project.saleAmount = msg.value;

		// Emit event
		emit BuildingCompleted(_projectId, project.buildingCompletedOn, project.saleAmount);
	}

	function buyShares(
		uint _projectId,
		uint _shares
	)
		external
		payable
		projectExists(_projectId)
		fundraisingNotExpired(_projectId)
		fundraisingNotCompleted(_projectId)
		nonReentrant
	{
		Project storage project = projects[_projectId];

		// Validate enough shares
		require(_shares > 0 && _shares <= project.totalShares - project.currentShares, 'Invalid shares count');

		// Calculate the amount equivalent to shares to buy
		uint _sharesAmount = _shares * getShareCost(_projectId);
		// Validate that the amount has been fully paid
		require(msg.value == _sharesAmount, 'Incorrect shares amount');

		// Save value
		project.currentShares += _shares;
		project.currentAmount += _sharesAmount;

		// Mint shares
		shareContract.mint(msg.sender, _projectId, _shares, '');

		// Emit event
		emit SharesBought(msg.sender, _projectId, _shares);

		// If reachend end goal complete fundraising
		if (project.currentShares == project.totalShares && project.currentAmount == project.goalAmount) {
			// Update data
			project.fundraisingCompletedOn = block.timestamp;

			// Emit event
			emit FundraisingCompleted(_projectId, project.fundraisingCompletedOn);
		}
	}

	function redeemFee(
		uint _projectId
	) external projectExists(_projectId) onlyBuilder(_projectId) buildingCompleted(_projectId) nonReentrant {
		Project storage project = projects[_projectId];

		// Check fee not redeemed yet
		require(!projectToFeeRedeemed[_projectId], 'Builder fee already redeemed');
		// Require that there was a profit otherwise nothing goes to the builder
		require(project.saleAmount - project.goalAmount > 0, 'No profit no party');

		// Calculate reedemable amount
		uint amountToRedeem = ((project.saleAmount - project.goalAmount) * project.builderFee) / 100;
		// Check that for some reasons doesn't exceed remaining one
		require(amountToRedeem <= project.currentAmount, 'Invalid amount to redeem');

		// Send amount to builder
		(bool success, ) = msg.sender.call{value: amountToRedeem}('');
		require(success, 'Failed to send amount');

		// Update data
		project.currentAmount -= amountToRedeem;
		// Save that fee has been redeemed to avoid doing it multiple times
		projectToFeeRedeemed[_projectId] = true;

		// Emit event
		emit FeeRedeemed(msg.sender, _projectId, amountToRedeem);
	}

	function redeemShares(
		uint _projectId,
		uint _shares
	) external projectExists(_projectId) buildingCompleted(_projectId) nonReentrant {
		Project storage project = projects[_projectId];

		// Get sender available shares
		uint investorShares = shareContract.balanceOf(msg.sender, _projectId);
		// Validate enough shares
		require(_shares > 0 && _shares <= investorShares, 'Invalid shares count');

		// Calculate reedemable amount
		uint amountToRedeem = _shares * getShareValue(_projectId);
		// Check that for some reasons doesn't exceed remaining one
		require(amountToRedeem <= project.currentAmount, 'Invalid amount to redeem');

		// Burn shares because they are redeemed
		// NB: Of course the sender must have approved this contract for managing its tokens
		shareContract.burn(msg.sender, _projectId, _shares);
		// Send amount to investor
		(bool success, ) = payable(msg.sender).call{value: amountToRedeem}('');
		require(success, 'Failed to send amount');

		// Update data
		project.currentAmount -= amountToRedeem;

		// Emit event
		emit SharesRedeemed(msg.sender, _projectId, _shares);
	}

	function getProjects() external view returns (Project[] memory) {
		Project[] memory projectsArray = new Project[](projects.length);
		for (uint i = 0; i < projects.length; i++) {
			projectsArray[i] = projects[i];
		}
		return projectsArray;
	}

	function getBuilderProjects(address _builder) external view returns (Project[] memory) {
		Project[] memory projectsArray = new Project[](builderToProjects[_builder].length);
		for (uint i = 0; i < builderToProjects[_builder].length; i++) {
			projectsArray[i] = projects[builderToProjects[_builder][i]];
		}
		return projectsArray;
	}

	function getProjectsCount() external view returns (uint) {
		return projects.length;
	}

	function getBuilderProjectsCount(address _builder) external view returns (uint) {
		return builderToProjects[_builder].length;
	}

	function getProject(uint _projectId) external view returns (Project memory) {
		Project memory project = projects[_projectId];
		return project;
	}

	function getShareCost(uint _projectId) public view returns (uint) {
		Project memory project = projects[_projectId];
		return project.goalAmount / project.totalShares;
	}

	function getShareValue(uint _projectId) public view returns (uint) {
		Project memory project = projects[_projectId];

		// Fundraising not finished yet
		if (project.saleAmount == 0) {
			return project.goalAmount / project.totalShares;
		}

		// Depending on profit for builder fee calculation
		if (project.saleAmount - project.goalAmount > 0) {
			// Profit
			uint builderFeeAmount = ((project.saleAmount - project.goalAmount) * project.builderFee) / 100;
			return (project.saleAmount - builderFeeAmount) / project.totalShares;
		} else {
			// No profit
			return project.saleAmount / project.totalShares;
		}
	}
}
