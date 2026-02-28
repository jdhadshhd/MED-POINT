/**
 * Admin Controller
 * Handles admin HTTP requests
 */
const adminService = require('./admin.service');
const reportsService = require('../shared/reports.service');

const adminController = {
  /**
   * GET /admin/portal - Show full admin portal page (from HTML design)
   */
  async showPortal(req, res) {
    try {
      res.render('admin/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Admin] Portal error:', error);
      res.status(500).render('shared/error', { message: 'Failed to load portal' });
    }
  },

  /**
   * GET /admin/dashboard - Show admin dashboard
   */
  async showDashboard(req, res) {
    try {
      res.render('admin/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Admin] Dashboard error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /admin/users - Show users list
   */
  async showUsers(req, res) {
    try {
      res.render('admin/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Admin] Users error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load users',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /admin/reports - Show reports page
   */
  async showReports(req, res) {
    try {
      res.render('admin/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Admin] Reports error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load reports',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /admin/support - Show support tickets
   */
  async showSupport(req, res) {
    try {
      res.render('admin/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Admin] Support error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load support tickets',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * GET /admin/support/:id - Show ticket detail
   */
  async showTicketDetail(req, res) {
    try {
      res.render('admin/views/portal', {
        layout: false,
        user: req.user,
      });
    } catch (error) {
      console.error('[Admin] Ticket detail error:', error);
      res.status(500).render('shared/error', {
        title: 'Error',
        message: 'Failed to load ticket',
        layout: 'shared/layout',
      });
    }
  },

  /**
   * POST /admin/support/:id/reply - Reply to ticket
   */
  async replyToTicket(req, res) {
    try {
      const { message } = req.body;
      const ticketId = req.params.id;

      if (!message || !message.trim()) {
        return res.redirect(`/admin/support/${ticketId}?error=Message is required`);
      }

      await adminService.replyToTicket({
        ticketId,
        adminId: req.user.id,
        message: message.trim(),
      });

      res.redirect(`/admin/support/${ticketId}`);
    } catch (error) {
      console.error('[Admin] Reply error:', error);
      res.redirect(`/admin/support/${req.params.id}?error=Failed to send reply`);
    }
  },

  /**
   * POST /admin/support/:id/status - Update ticket status
   */
  async updateTicketStatus(req, res) {
    try {
      const { status } = req.body;
      const ticketId = req.params.id;

      await adminService.updateTicketStatus(ticketId, status, req.user.id);

      res.redirect(`/admin/support/${ticketId}`);
    } catch (error) {
      console.error('[Admin] Status update error:', error);
      res.redirect(`/admin/support/${req.params.id}?error=Failed to update status`);
    }
  },

  /**
   * GET /admin/settings - Show settings page
   */
  showSettings(req, res) {
    res.render('admin/views/portal', {
      layout: false,
      user: req.user,
    });
  },

  /**
   * GET /admin/reports/system/download - Download system report PDF
   */
  async downloadSystemReport(req, res) {
    try {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=system-report.pdf');
      await reportsService.generateSystemReport(res);
    } catch (error) {
      console.error('[Admin] System report download error:', error);
      res.status(500).send('Failed to generate report');
    }
  },

  /**
   * GET /admin/reports/patient/:id/download - Download patient report PDF
   */
  async downloadPatientReport(req, res) {
    try {
      const { id } = req.params;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=patient-report-${id}.pdf`);
      await reportsService.generatePatientReport(res, id);
    } catch (error) {
      console.error('[Admin] Patient report download error:', error);
      res.status(500).send('Failed to generate report');
    }
  },

  // --- JSON API Endpoints ---

  async getDashboardStatsApi(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, ...stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getUsersApi(req, res) {
    try {
      const users = await adminService.getUsers(req.query);
      res.json({ success: true, users: users.users, total: users.total });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createUserApi(req, res) {
    try {
      const user = await adminService.createUser(req.body);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateUserApi(req, res) {
    try {
      const user = await adminService.updateUser(req.params.id, req.body);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteUserApi(req, res) {
    try {
      await adminService.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getPendingRequestsApi(req, res) {
    try {
      const requests = await adminService.getPendingRequests();
      res.json({ success: true, requests });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async approveRequestApi(req, res) {
    try {
      const user = await adminService.approveRequest(req.params.id);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getTicketsApi(req, res) {
    try {
      const tickets = await adminService.getAllTickets();
      res.json({ success: true, tickets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createTicketApi(req, res) {
    try {
      const { title, description, priority, subject, category } = req.body;
      // Support both 'title' and 'subject' field names from the portal
      const ticketTitle = title || subject || 'Untitled';
      const ticket = await adminService.createTicket({
        userId: req.user.id,
        title: ticketTitle,
        description: description || '',
        priority: (priority || 'MEDIUM').toUpperCase(),
      });
      res.json({ success: true, ticket });
    } catch (error) {
      console.error('[AdminAPI] createTicket error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getFAQsApi(req, res) {
    try {
      const faqs = await adminService.getFAQs();
      res.json({ success: true, faqs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createFAQApi(req, res) {
    try {
      const faq = await adminService.createFAQ(req.body);
      res.json({ success: true, faq });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateFAQApi(req, res) {
    try {
      const faq = await adminService.updateFAQ(req.params.id, req.body);
      res.json({ success: true, faq });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteFAQApi(req, res) {
    try {
      await adminService.deleteFAQ(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async saveSettingsApi(req, res) {
    try {
      await adminService.saveSettings(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async loadSettingsApi(req, res) {
    try {
      const settings = await adminService.loadSettings();
      res.json({ success: true, settings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async replyToTicketApi(req, res) {
    try {
      const { message } = req.body;
      const ticketId = req.params.id;
      if (!message) throw new Error('Message is required');

      const reply = await adminService.replyToTicket({
        ticketId,
        adminId: req.user.id,
        message,
      });
      res.json({ success: true, reply });
    } catch (error) {
      console.error('[AdminAPI] replyToTicket error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateTicketStatusApi(req, res) {
    try {
      const { status } = req.body;
      const ticketId = req.params.id;
      await adminService.updateTicketStatus(ticketId, status, req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async exportUsersApi(req, res) {
    try {
      const users = await adminService.getUsers({});
      // Simple CSV generation
      const header = 'Name,Email,Role,Status,Joined\n';
      const rows = users.users.map(u => `${u.name},${u.email},${u.role},${u.status},${u.createdAt}`).join('\n');
      const csv = header + rows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = adminController;
