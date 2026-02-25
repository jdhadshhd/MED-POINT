/**
 * Admin Controller
 * Handles admin HTTP requests
 */
const adminService = require('./admin.service');

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
      res.render('admin/views/dashboard', {
        layout: false,
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
      const { page = 1, role } = req.query;
      const result = await adminService.getUsers({ page: parseInt(page), role });
      const userCounts = await adminService.getUserCounts();

      res.render('admin/views/users', {
        title: 'Users',
        ...result,
        userCounts,
        currentRole: role || 'all',
        layout: 'shared/layout',
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
      const stats = await adminService.getDashboardStats();

      res.render('admin/views/reports', {
        title: 'Reports',
        stats,
        layout: 'shared/layout',
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
      const tickets = await adminService.getAllTickets();

      res.render('admin/views/support', {
        title: 'Support Tickets',
        tickets,
        layout: 'shared/layout',
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
      const ticket = await adminService.getTicketById(req.params.id);

      if (!ticket) {
        return res.status(404).render('shared/error', {
          title: 'Not Found',
          message: 'Ticket not found',
          statusCode: 404,
          layout: 'shared/layout',
        });
      }

      res.render('admin/views/ticket-detail', {
        title: `Ticket: ${ticket.title}`,
        ticket,
        layout: 'shared/layout',
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
    res.render('admin/views/settings', {
      title: 'Settings',
      layout: 'shared/layout',
    });
  },
};

module.exports = adminController;
