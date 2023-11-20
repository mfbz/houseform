// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@klaytn/contracts/KIP/token/KIP37/IKIP37.sol';
import '@klaytn/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './HouseformShare.sol';

contract HouseformManager is Ownable, ReentrancyGuard {
	struct Project {
		address payable builder;
		string name;
		string description;
		string image;
		uint currentAmount;
		uint goalAmount;
		uint saleAmount; // Amount at which the project is sold
		uint expectedProfit; // Expected profit for investors
		uint currentShares;
		uint totalShares;
		uint fundraisingDeadline; // Deadline timestamp for reaching the fundraising goal
		uint fundraisingCompletedOn;
		uint buildingStartedOn;
		uint buildingCompletedOn;
	}

	// The main multitoken contract that handles shares
	HouseformShare public shareContract;

	Project[] public projects;
	mapping(uint => address) public projectToBuilder;
	mapping(address => uint) builderProjectCount;

	event ProjectCreated(
		uint projectId,
		string name,
		string description,
		string image,
		uint goalAmount,
		uint expectedProfit,
		uint builderShares,
		uint totalShares,
		uint fundraisingDeadline
	);
	event BuildingStarted(uint projectId, uint buildingStartedOn);
	event BuildingCompleted(uint projectId, uint buildingCompletedOn, uint saleAmount);
	event SharesBought(address account, uint projectId, uint shares);
	event SharesRedeemed(address account, uint projectId, uint shares);
	event FundraisingCompleted(uint projectId, uint fundraisingCompletedOn);

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
		uint _goalAmount,
		string memory _name,
		string memory _description,
		string memory _image,
		uint _builderShares,
		uint _totalShares,
		uint _expectedProfit,
		uint _fundraisingDeadline
	) external nonReentrant {
		// Validate inputs
		require(_goalAmount > 0, 'Invalid goal amount');
		require(_builderShares > 0 && _builderShares < _totalShares, 'Invalid builder shares');
		require(_totalShares > 1, 'Invalid total shares');
		require(_expectedProfit >= 0, 'Invalid expected profit');
		// NB: At least 7 days of deadline
		require(_fundraisingDeadline >= block.timestamp + 7 days, 'Invalid fundraising deadline');

		// Push new project into the array
		projects.push(
			Project({
				builder: payable(msg.sender),
				name: _name,
				description: _description,
				image: _image,
				currentAmount: 0,
				goalAmount: _goalAmount,
				saleAmount: 0,
				expectedProfit: _expectedProfit,
				currentShares: _builderShares,
				totalShares: _totalShares,
				fundraisingDeadline: _fundraisingDeadline,
				fundraisingCompletedOn: 0,
				buildingStartedOn: 0,
				buildingCompletedOn: 0
			})
		);
		// Get new project id that is its index in the array
		uint id = projects.length - 1;

		// Save data
		projectToBuilder[id] = msg.sender;
		builderProjectCount[msg.sender]++;

		// Mint initial shares to builder
		shareContract.mint(msg.sender, id, _builderShares, '');

		// Emit event
		emit ProjectCreated(
			id,
			_name,
			_description,
			_image,
			_goalAmount,
			_expectedProfit,
			_builderShares,
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

	function getShareCost(uint _projectId) public view returns (uint) {
		Project memory project = projects[_projectId];
		return project.goalAmount / project.totalShares;
	}

	function getShareValue(uint _projectId) public view returns (uint) {
		Project memory project = projects[_projectId];
		return (project.saleAmount == 0 ? project.goalAmount : project.saleAmount) / project.totalShares;
	}
}
