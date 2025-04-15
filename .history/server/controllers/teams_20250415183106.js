const teamsModel = require("../models/teams");
const socket = require("../socket");
const { addNotification } = require("./notifications");
const teamsValidation = require("../validation/teamsValidation.js");

/* Create Team */
const CreateTeam = async (req, res) => {
  const { errors, isValid } = teamsValidation(req.body);
  try {
    if (!isValid) {
      res.status(404).json(errors);
    } else {
      // Start with the creator as ADMIN
      const members = [{
        user: req.user._id,
        role: "ADMIN",
        joinedAt: new Date()
      }];

      // Add other members from the request with default role
      if (req.body.members && Array.isArray(req.body.members)) {
        req.body.members.forEach(memberId => {
          if (!memberId.equals(req.user._id)) { // Don't add creator again
            members.push({
              user: memberId,
              role: "ENGINEER", // Default role for invited members
              joinedAt: new Date()
            });
          }
        });
      }

      const newTeam = {
        Name: req.body.Name,
        description: req.body.description,
        creatorid: req.user._id,
        pictureprofile: req.body.pictureprofile || null,
        members: members
      };

      const data = await teamsModel.create(newTeam);

      // Send notifications to all new members (excluding creator)
      const newMemberIds = members.slice(1).map(m => m.user);
      if (newMemberIds.length > 0) {
        const notification = await addNotification({
          receivers: newMemberIds,
          link: `/teams/${data._id}`,
          text: `You've been added to a new team: ${data.Name}`
        });

        // Send notifications to all new members' sockets
        const sockets = newMemberIds.reduce((acc, id) => 
          [...acc, ...socket.methods.getUserSockets(id)], []);
        
        if (sockets.length > 0) {
          socket.io.to(sockets).emit("notification", notification);
        }
      }

      // Send notification to creator
      const creatorNotification = await addNotification({
        receiver: req.user._id,
        link: `/teams/${data._id}`,
        text: `You created a new team: ${data.Name}`
      });

      const userSockets = socket.methods.getUserSockets(req.user._id);
      if (userSockets.length > 0) {
        socket.io.to(userSockets).emit("notification", creatorNotification);
      }

      res.status(201).json({
        success: true,
        data: data
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Get All Teams */
const GetAllTeams = async (req, res) => {
  try {
    const data = await teamsModel.find()
      .populate({
        path: "creatorid",
        select: "-password"
      })
      .populate({
        path: "members.user",
        select: "-password"
      });

    res.status(200).json({
      length: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Get Single Team */
const GetTeam = async (req, res) => {
  try {
    const data = await teamsModel.findById(req.params.id)
      .populate({
        path: "creatorid",
        select: "-password"
      })
      .populate({
        path: "members.user",
        select: "-password"
      });

    if (!data) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Get All Teams for Current User */
const GetUserTeams = async (req, res) => {
    try {
      const userId = req.user._id; // Authenticated user's ID
      
      // Teams where user is the creator
      const createdTeams = await teamsModel.find({ creatorid: userId })
        .populate({
          path: "creatorid",
          select: "-password"
        })
        .populate({
          path: "members.user",
          select: "-password"
        });
  
      // Teams where user is a member (but not creator)
      const joinedTeams = await teamsModel.find({
        "members.user": userId,
        creatorid: { $ne: userId } // Exclude teams where user is creator
      })
      .populate({
        path: "creatorid",
        select: "-password"
      })
      .populate({
        path: "members.user",
        select: "-password"
      });
  
      res.status(200).json({
        success: true,
        data: {
          createdTeams: createdTeams,
          joinedTeams: joinedTeams,
          allTeams: [...createdTeams, ...joinedTeams] // Combined list
        }
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
/* Update Team */
const UpdateTeam = async (req, res) => {
  const errors = teamsValidation(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {
      Name: req.body.Name,
      description: req.body.description,
      pictureprofile: req.body.pictureprofile
    };

    const data = await teamsModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate({
      path: "members.user",
      select: "-password"
    });

    if (!data) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Notify all team members about the update
    const memberIds = data.members.map(m => m.user._id);
    const notification = await addNotification({
      receivers: memberIds,
      link: `/teams/${data._id}`,
      text: `Team ${data.Name} has been updated`
    });

    const sockets = memberIds.reduce((t, n) => (
      t = [...t, ...socket.methods.getUserSockets(n)]
    ), []);

    if (sockets.length > 0) {
      socket.io.to(sockets).emit("notification", notification);
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Delete Team */
// In your teams controller
const DeleteTeam = async (req, res) => {
    try {
      const team = await teamsModel.findByIdAndDelete(req.params.id);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      // Notify members
      const memberIds = team.members.map(m => m.user);
      const notification = await addNotification({
        receivers: memberIds,
        text: `Team ${team.Name} has been deleted`
      });
  
      // Send notifications
      const sockets = memberIds.reduce((acc, id) => 
        [...acc, ...socket.methods.getUserSockets(id)], []);
  
      if (sockets.length > 0) {
        socket.io.to(sockets).emit("notification", notification);
      }
  
      res.status(200).json({ 
        success: true,
        message: "Team deleted successfully" 
      });
  
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

/* Add Member to Team */
const AddMember = async (req, res) => {
  try {
    const team = await teamsModel.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is already a member
    const isMember = team.members.some(m => m.user.equals(req.body.userId));
    if (isMember) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    team.members.push({
      user: req.body.userId,
      role: req.body.role || "ENGINEER"
    });

    const updatedTeam = await team.save();

    // Send notification to new member
    const notification = await addNotification({
      receiver: req.body.userId,
      link: `/teams/${team._id}`,
      text: `You've been added to team: ${team.Name}`
    });

    const sockets = socket.methods.getUserSockets(req.body.userId);
    if (sockets.length > 0) {
      socket.io.to(sockets).emit("notification", notification);
    }

    res.status(200).json({
      success: true,
      data: updatedTeam
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Remove Member from Team */
const RemoveMember = async (req, res) => {
  try {
    const team = await teamsModel.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Can't remove the creator
    if (team.creatorid.equals(req.body.userId)) {
      return res.status(400).json({ message: "Cannot remove team creator" });
    }

    team.members = team.members.filter(
      m => !m.user.equals(req.body.userId)
    );

    const updatedTeam = await team.save();

    // Notify removed user
    const notification = await addNotification({
      receiver: req.body.userId,
      text: `You've been removed from team: ${team.Name}`
    });

    const sockets = socket.methods.getUserSockets(req.body.userId);
    if (sockets.length > 0) {
      socket.io.to(sockets).emit("notification", notification);
    }

    res.status(200).json({
      success: true,
      data: updatedTeam
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* Update Member Role */
const UpdateMemberRole = async (req, res) => {
  try {
    const team = await teamsModel.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const member = team.members.find(
      m => m.user.equals(req.body.userId)
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found in team" });
    }

    member.role = req.body.role;
    const updatedTeam = await team.save();

    // Notify member about role change
    const notification = await addNotification({
      receiver: req.body.userId,
      link: `/teams/${team._id}`,
      text: `Your role in team ${team.Name} has been changed to ${req.body.role}`
    });

    const sockets = socket.methods.getUserSockets(req.body.userId);
    if (sockets.length > 0) {
      socket.io.to(sockets).emit("notification", notification);
    }

    res.status(200).json({
      success: true,
      data: updatedTeam
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  CreateTeam,
  GetAllTeams,
  GetTeam,
  GetUserTeams,
  UpdateTeam,
  DeleteTeam,
  AddMember,
  RemoveMember,
  UpdateMemberRole
};