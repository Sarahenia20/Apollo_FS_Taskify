const teamsModel = require("../models/teams");
const socket = require("../socket");
const { addNotification } = require("./notifications");
const teamsValidation = require("../validation/teamsValidation.js");

/* Create Team */
const CreateTeam = async (req, res) => {
    console.log('Received team creation request with body:', JSON.stringify(req.body));
    console.log('Members array received:', JSON.stringify(req.body.members));
    
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized: No user authenticated" });
      }
      
      const { errors, isValid } = teamsValidation(req.body);
      if (!isValid) {
        console.log('Validation errors:', errors);
        return res.status(400).json(errors);
      }
  
      const mongoose = require('mongoose');
      
      // Validate and prepare members array
      const members = [{
        user: req.user._id,
        role: "ADMIN",
        joinedAt: new Date()
      }];
  
      console.log('Initial members array (creator only):', JSON.stringify(members));
  
      if (req.body.members && Array.isArray(req.body.members)) {
        console.log('Processing additional members. Count:', req.body.members.length);
        
        for (const memberId of req.body.members) {
          try {
            if (!memberId) {
              console.log('Skipping null/undefined member ID');
              continue;
            }
            
            console.log('Processing member ID:', memberId);
            
            const memberObjectId = new mongoose.Types.ObjectId(memberId);
            const creatorObjectId = new mongoose.Types.ObjectId(req.user._id.toString());
            
            if (!memberObjectId.equals(creatorObjectId)) {
              console.log('Adding member to team:', memberId);
              members.push({
                user: memberObjectId,
                role: "ENGINEER",
                joinedAt: new Date()
              });
            } else {
              console.log('Skipping creator duplicate:', memberId);
            }
          } catch (error) {
            console.error(`Invalid member ID: ${memberId}`, error);
            continue;
          }
        }
      }
  
      console.log('Final members array before saving:', JSON.stringify(members));
  
      const newTeam = {
        Name: req.body.Name,
        description: req.body.description,
        creatorid: req.user._id,
        pictureprofile: req.body.pictureprofile || null,
        members: members
      };
  
      console.log('Attempting to save team:', JSON.stringify(newTeam));
      const data = await teamsModel.create(newTeam);
      console.log('Team created successfully with ID:', data._id);
      
      // Log activity for team creation
      if (req.logActivity) {
        req.logActivity(
          "Created Team",
          `Created team: ${data.Name}`,
          "team_action",
          data._id,
          "Team"
        ).catch(err => console.error("Error logging team activity:", err));
        
        console.log("✅ Activity logged for team creation:", data._id);
      }
      
      res.status(201).json({
        success: true,
        data
      });
  
    } catch (error) {
      console.error('Complete team creation error:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });
      
      res.status(500).json({ 
        success: false,
        error: error.message, 
        details: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          receivedData: req.body
        } : undefined
      });
    }
};

/* Get All Teams */
const GetAllTeams = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user authenticated" });
    }
    const data = await teamsModel.find()
      .populate({
        path: "creatorid",
        select: "-password"
      })
      .populate({
        path: "members.user",
        select: "-password"
      });

    // Log activity for fetching all teams
    if (req.logActivity) {
      req.logActivity(
        "Fetched All Teams",
        `User ${req.user.email} fetched all teams`,
        "team_fetch",
        null,
        "Team"
      ).catch(err => console.error("Error logging activity:", err));
    }

    res.status(200).json({
      length: data.length,
      data: data
    });
  } catch (error) {
    console.error("GetAllTeams error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* Get Single Team */
const GetTeam = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user authenticated" });
    }
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

    // Log activity for fetching single team
    if (req.logActivity) {
      req.logActivity(
        "Fetched Team",
        `Fetched team: ${data.Name}`,
        "team_fetch",
        data._id,
        "Team"
      ).catch(err => console.error("Error logging activity:", err));
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("GetTeam error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* Get All Teams for Current User */
const GetUserTeams = async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized: No user authenticated" });
      }
      const userId = req.user._id;
      
      const createdTeams = await teamsModel.find({ creatorid: userId })
        .populate({
          path: "creatorid",
          select: "-password"
        })
        .populate({
          path: "members.user",
          select: "-password"
        });
  
      const joinedTeams = await teamsModel.find({
        "members.user": userId,
        creatorid: { $ne: userId }
      })
      .populate({
        path: "creatorid",
        select: "-password"
      })
      .populate({
        path: "members.user",
        select: "-password"
      });
  
      // Log activity for fetching user teams
      if (req.logActivity) {
        req.logActivity(
          "Fetched User Teams",
          `User ${req.user.email} fetched their teams`,
          "team_fetch",
          null,
          "Team"
        ).catch(err => console.error("Error logging activity:", err));
      }

      res.status(200).json({
        success: true,
        data: {
          createdTeams: createdTeams,
          joinedTeams: joinedTeams,
          allTeams: [...createdTeams, ...joinedTeams]
        }
      });
  
    } catch (error) {
      console.error("GetUserTeams error:", error);
      res.status(500).json({ error: error.message });
    }
};

/* Update Team */
const UpdateTeam = async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized: No user authenticated" });
      }
      const { errors, isValid } = teamsValidation(req.body);
      if (!isValid) {
        return res.status(400).json(errors);
      }
  
      const updates = {
        Name: req.body.Name,
        description: req.body.description
      };
      
      if (req.body.pictureprofile) {
        updates.pictureprofile = req.body.pictureprofile;
      }
      
      if (req.body.members && Array.isArray(req.body.members)) {
        const members = [];
        const team = await teamsModel.findById(req.params.id);
        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }
        
        const creatorIncluded = req.body.members.some(m => 
          m.toString() === team.creatorid.toString() || 
          (typeof m === 'object' && m.user && m.user.toString() === team.creatorid.toString())
        );
        
        if (!creatorIncluded) {
          members.push({
            user: team.creatorid,
            role: "ADMIN",
            joinedAt: new Date()
          });
        }
        
        for (const member of req.body.members) {
          const userId = typeof member === 'object' ? member.user : member;
          const role = typeof member === 'object' ? member.role : "ENGINEER";
          
          if (members.some(m => m.user.toString() === userId.toString())) {
            continue;
          }
          
          members.push({
            user: userId,
            role: role || "ENGINEER",
            joinedAt: new Date()
          });
        }
        
        updates.members = members;
      }
  
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
  
      // Log activity for team update
      if (req.logActivity) {
        req.logActivity(
          "Updated Team",
          `Updated team: ${data.Name}`,
          "team_action",
          data._id,
          "Team"
        ).catch(err => console.error("Error logging activity:", err));
      }

      const memberIds = data.members.map(m => m.user._id || m.user);
      
      try {
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
      } catch (notifyError) {
        console.error("Error sending notifications:", notifyError);
      }
  
      res.status(200).json({
        success: true,
        data: data
      });
  
    } catch (error) {
      console.error("Team update error:", error);
      res.status(500).json({ error: error.message });
    }
};

/* Delete Team */
const DeleteTeam = async (req, res) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Unauthorized: No user authenticated" });
      }
      const team = await teamsModel.findByIdAndDelete(req.params.id);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      // Log activity for team deletion
      if (req.logActivity) {
        req.logActivity(
          "Deleted Team",
          `Deleted team: ${team.Name}`,
          "team_action",
          team._id,
          "Team"
        ).catch(err => console.error("Error logging activity:", err));
      }

      const memberIds = team.members.map(m => m.user);
      const notification = await addNotification({
        receivers: memberIds,
        text: `Team ${team.Name} has been deleted`
      });
  
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user authenticated" });
    }
    const team = await teamsModel.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.members.some(m => m.user.equals(req.body.userId));
    if (isMember) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    team.members.push({
      user: req.body.userId,
      role: req.body.role || "ENGINEER"
    });

    const updatedTeam = await team.save();

    // Log activity for adding member
    if (req.logActivity) {
      req.logActivity(
        "Added Team Member",
        `Added member ${req.body.userId} to team: ${team.Name}`,
        "team_action",
        team._id,
        "Team"
      ).catch(err => console.error("Error logging activity:", err));
    }

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
    console.error("AddMember error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* Remove Member from Team */
const RemoveMember = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user authenticated" });
    }
    const team = await teamsModel.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.creatorid.equals(req.body.userId)) {
      return res.status(400).json({ message: "Cannot remove team creator" });
    }

    team.members = team.members.filter(
      m => !m.user.equals(req.body.userId)
    );

    const updatedTeam = await team.save();

    // Log activity for removing member
    if (req.logActivity) {
      req.logActivity(
        "Removed Team Member",
        `Removed member ${req.body.userId} from team: ${team.Name}`,
        "team_action",
        team._id,
        "Team"
      ).catch(err => console.error("Error logging activity:", err));
    }

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
    console.error("RemoveMember error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* Update Member Role */
const UpdateMemberRole = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user authenticated" });
    }
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

    // Log activity for updating member role
    if (req.logActivity) {
      req.logActivity(
        "Updated Team Member Role",
        `Changed role of member ${req.body.userId} to ${req.body.role} in team: ${team.Name}`,
        "team_action",
        team._id,
        "Team"
      ).catch(err => console.error("Error logging activity:", err));
    }

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
    console.error("UpdateMemberRole error:", error);
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