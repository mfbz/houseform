// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract HouseformManager is Ownable {
	struct ConstructionProject {
		address payable developer;
		uint256 goalAmount;
		uint256 currentAmount;
		uint256 totalInvestors;
		bool projectCompleted;
		uint256 fundraisingDeadline; // Deadline timestamp for reaching the fundraising goal
		uint256 completionDeadline; // Deadline timestamp for completing the project goal
		uint256 saleAmount; // Amount at which the project is sold
		uint256 developerShare; // Percentage of the sale amount that goes to the developer
	}

	mapping(uint256 => ConstructionProject) public constructionProjects;
	mapping(address => uint256[]) public developerProjects;
	mapping(uint256 => uint256) public nftIdToProjectId;

	address public houseformShareNFTAddress;

	event InvestmentMade(address investor, uint256 projectId, uint256 amount, uint256 sharesBought);
	event ProjectCompleted(uint256 projectId, uint256 totalReturns);
	event ShareNFTMinted(address indexed investor, uint256 indexed projectId, uint256 tokenId, uint256 sharesBought);
	event ShareRedeemed(address indexed investor, uint256 indexed projectId, uint256 amount);
	event ShareBurned(address indexed investor, uint256 indexed projectId, uint256 tokenId);
	event ProjectCancelled(uint256 projectId);
	event FundraisingFailed(uint256 projectId);

	modifier onlyProjectOwner(uint256 _projectId) {
		require(constructionProjects[_projectId].developer == msg.sender, 'Caller is not the project owner');
		_;
	}

	modifier onlyDeveloper(uint256 _projectId) {
		require(constructionProjects[_projectId].developer == msg.sender, 'Caller is not the project developer');
		_;
	}

	modifier onlyCustomer(uint256 _projectId) {
		require(_isCustomer(_projectId, msg.sender), 'Caller is not a customer for this project');
		_;
	}

	modifier projectNotCompleted(uint256 _projectId) {
		require(!constructionProjects[_projectId].projectCompleted, 'Project is already completed');
		_;
	}

	modifier projectNotCancelled(uint256 _projectId) {
		require(constructionProjects[_projectId].completionDeadline > 0, 'Project is cancelled');
		_;
	}

	modifier projectNotExpired(uint256 _projectId) {
		require(
			constructionProjects[_projectId].completionDeadline == 0 ||
				block.timestamp <= constructionProjects[_projectId].completionDeadline,
			'Project deadline expired'
		);
		_;
	}

	modifier fundraisingDeadlineNotExpired(uint256 _projectId) {
		require(
			constructionProjects[_projectId].fundraisingDeadline == 0 ||
				block.timestamp <= constructionProjects[_projectId].fundraisingDeadline,
			'Fundraising deadline expired'
		);
		_;
	}

	constructor() {}

	receive() external payable {
		// Handle received Ether, if necessary
	}

	function sethouseformShareNFT(address _houseformShareNFTAddress) external onlyOwner {
		houseformShareNFTAddress = _houseformShareNFTAddress;
	}

	function createConstructionProject(
		uint256 _projectId,
		uint256 _goalAmount,
		uint256 _fundraisingDeadline,
		uint256 _completionDeadline,
		uint256 _saleAmount,
		uint256 _developerShare
	) external {
		require(constructionProjects[_projectId].developer == address(0), 'Project already exists');
		require(_fundraisingDeadline >= block.timestamp, 'Fundraising deadline must be in the future');

		constructionProjects[_projectId] = ConstructionProject({
			developer: payable(msg.sender),
			goalAmount: _goalAmount,
			currentAmount: 0,
			totalInvestors: 0,
			projectCompleted: false,
			fundraisingDeadline: _fundraisingDeadline,
			completionDeadline: _completionDeadline,
			saleAmount: _saleAmount,
			developerShare: _developerShare
		});

		developerProjects[msg.sender].push(_projectId);
	}

	function invest(
		uint256 _projectId,
		uint256 _investmentAmount,
		uint256 _sharesToBuy
	)
		external
		payable
		onlyCustomer(_projectId)
		projectNotCompleted(_projectId)
		projectNotExpired(_projectId)
		fundraisingDeadlineNotExpired(_projectId)
	{
		ConstructionProject storage project = constructionProjects[_projectId];

		require(project.developer != address(0), 'Project does not exist');
		require(msg.value == _investmentAmount, 'Incorrect investment amount');
		require(
			_sharesToBuy > 0 && _sharesToBuy <= project.goalAmount.sub(project.currentAmount),
			'Invalid number of shares'
		);

		project.currentAmount = project.currentAmount.add(_investmentAmount);
		project.totalInvestors = project.totalInvestors.add(1);

		_mintShareNFT(msg.sender, _projectId, _sharesToBuy);

		emit InvestmentMade(msg.sender, _projectId, _investmentAmount, _sharesToBuy);

		if (project.currentAmount >= project.goalAmount) {
			_completeFundraising(_projectId);
		}
	}

	function _completeFundraising(uint256 _projectId) internal onlyDeveloper(_projectId) {
		ConstructionProject storage project = constructionProjects[_projectId];

		// If the goal is reached, cancel the fundraisingDeadline and allow completion of the project
		project.fundraisingDeadline = 0;

		// Emit event indicating successful fundraising
		emit FundraisingFailed(_projectId);
	}

	function redeemShare(
		uint256 _projectId
	)
		external
		onlyCustomer(_projectId)
		projectNotCompleted(_projectId)
		projectNotExpired(_projectId)
		projectNotCancelled(_projectId)
	{
		ConstructionProject storage project = constructionProjects[_projectId];

		// Check if the project completion deadline has passed
		require(block.timestamp > project.completionDeadline, 'Project completion deadline not reached');

		uint256 tokenId = _getInvestorTokenId(msg.sender, _projectId);

		_burnShareNFT(msg.sender, tokenId);

		uint256 amountToRedeem = (project.currentAmount * project.developerShare) / 100;

		payable(msg.sender).transfer(amountToRedeem);

		emit ShareRedeemed(msg.sender, _projectId, amountToRedeem);
	}

	function getProjectByNFTId(uint256 _nftId) external view returns (ConstructionProject memory) {
		uint256 projectId = nftIdToProjectId[_nftId];
		return constructionProjects[projectId];
	}

	function getAllProjects() external view returns (uint256[] memory) {
		uint256[] memory projectIds = developerProjects[msg.sender];
		return projectIds;
	}

	function getProjectById(uint256 _projectId) external view returns (ConstructionProject memory) {
		return constructionProjects[_projectId];
	}

	function getProjectsByDeveloper(address _developer) external view returns (uint256[] memory) {
		return developerProjects[_developer];
	}

	function _isCustomer(uint256 _projectId, address _customer) internal view returns (bool) {
		uint256[] storage customerProjects = developerProjects[_customer];
		for (uint256 i = 0; i < customerProjects.length; i++) {
			if (customerProjects[i] == _projectId) {
				return true;
			}
		}
		return false;
	}
}
