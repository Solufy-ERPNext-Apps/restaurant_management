frappe.pages["restaurant-dashboard"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Restaurant Dashboard"),
		single_column: true
	});

	const state = {
		isLoading: false,
		kpiRoutes: {}
	};

	const shell = $(`
		<div class="rm-dashboard-shell">
			<style>
				.rm-dashboard-shell {
					--rm-text: #1b1f23;
					--rm-subtext: #636e72;
					--rm-border: #d1d8dd;
					--rm-surface: #ffffff;
					--rm-shadow: 0 10px 26px rgba(44, 62, 80, 0.08);
					padding: 14px 10px 28px;
					background: linear-gradient(180deg, #f7f9fb 0%, #eef2f5 100%);
					position: relative;
					overflow: hidden;
				}
				@keyframes rmFloat {
					0%, 100% { transform: translateY(0px); }
					50% { transform: translateY(-10px); }
				}
				@keyframes rmFadeUp {
					from {
						opacity: 0;
						transform: translateY(18px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes rmPulseGlow {
					0%, 100% { box-shadow: 0 0 0 rgba(46, 204, 113, 0); }
					50% { box-shadow: 0 0 0 8px rgba(46, 204, 113, 0.08); }
				}
				@keyframes rmShimmer {
					0% { transform: translateX(-140%); }
					100% { transform: translateX(140%); }
				}
				.rm-dashboard-shell::before,
				.rm-dashboard-shell::after {
					content: "";
					position: absolute;
					border-radius: 999px;
					filter: blur(10px);
					pointer-events: none;
				}
				.rm-dashboard-shell::before {
					width: 220px;
					height: 220px;
					right: -60px;
					top: 40px;
					background: radial-gradient(circle, rgba(39, 174, 96, 0.12), rgba(39, 174, 96, 0.02));
					animation: rmFloat 8s ease-in-out infinite;
				}
				.rm-dashboard-shell::after {
					width: 180px;
					height: 180px;
					left: -50px;
					bottom: 40px;
					background: radial-gradient(circle, rgba(243, 156, 18, 0.12), rgba(243, 156, 18, 0.02));
					animation: rmFloat 10s ease-in-out infinite reverse;
				}
				.rm-hero {
					padding: 22px;
					border-radius: 22px;
					background: linear-gradient(135deg, #ffffff 0%, #f8fbfd 100%);
					color: var(--rm-text);
					border: 1px solid #d1d8dd;
					box-shadow: 0 8px 22px rgba(44, 62, 80, 0.08);
					position: relative;
					overflow: hidden;
					animation: rmFadeUp .45s ease-out both;
				}
				.rm-hero::before {
					content: "";
					position: absolute;
					width: 320px;
					height: 320px;
					right: -120px;
					top: -170px;
					border-radius: 50%;
					background: radial-gradient(circle, rgba(41, 128, 185, 0.1), rgba(41, 128, 185, 0.02));
					animation: rmFloat 9s ease-in-out infinite;
				}
				.rm-hero::after {
					content: "";
					position: absolute;
					inset: 0;
					background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.8) 45%, transparent 70%);
					transform: translateX(-140%);
					animation: rmShimmer 7s ease-in-out infinite;
					pointer-events: none;
				}
				.rm-hero-top {
					display: flex;
					justify-content: space-between;
					gap: 16px;
					flex-wrap: wrap;
				}
				.rm-hero h2 {
					margin: 0 0 6px;
					font-size: 30px;
					font-weight: 700;
					color: #ffffff;
				}
				.rm-hero p {
					margin: 0;
					color: var(--rm-subtext);
				}
				.rm-hero-actions {
					display: flex;
					gap: 10px;
					align-items: flex-start;
					position: relative;
					z-index: 1;
				}
				.rm-hero .btn.btn-light,
				.rm-hero .btn.btn-default {
					background: #f1f2f6;
					border-color: #d1d8dd;
					color: #2c3e50;
					transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
				}
				.rm-hero .btn.btn-light:hover,
				.rm-hero .btn.btn-default:hover {
					background: #e9edf2;
					transform: translateY(-1px);
				}
				.rm-hero .btn.btn-primary {
					background: #27ae60;
					border-color: transparent;
					color: #fff;
					transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
				}
				.rm-hero .btn.btn-warning {
					background: #f39c12;
					border-color: transparent;
					color: #fff;
					transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
				}
				.rm-hero .btn:hover {
					transform: translateY(-2px);
					box-shadow: 0 10px 20px rgba(44, 62, 80, 0.12);
				}
				.rm-filters {
					display: grid;
					grid-template-columns: 260px minmax(0, 1fr);
					gap: 16px;
					align-items: stretch;
					margin-top: 16px;
					position: relative;
					z-index: 1;
					padding: 16px;
					border-radius: 20px;
					background: #ffffff;
					border: 1px solid #d7e0e7;
					box-shadow: 0 14px 28px rgba(44, 62, 80, 0.08);
					animation: rmFadeUp .55s ease-out both;
				}
				.rm-filter-summary {
					padding: 16px 18px;
					border-radius: 16px;
					background: linear-gradient(135deg, #244736 0%, #2f5d46 100%);
					color: #ffffff;
					position: relative;
					overflow: hidden;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					gap: 14px;
				}
				.rm-filter-summary::after {
					content: "";
					position: absolute;
					width: 170px;
					height: 170px;
					top: -72px;
					right: -52px;
					border-radius: 50%;
					background: radial-gradient(circle, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.02));
					pointer-events: none;
				}
				.rm-filter-kicker {
					font-size: 11px;
					letter-spacing: 0.12em;
					text-transform: uppercase;
					font-weight: 700;
					color: rgba(255, 255, 255, 0.72);
					position: relative;
					z-index: 1;
				}
				.rm-filter-headline {
					font-size: 22px;
					line-height: 1.15;
					font-weight: 700;
					color: #ffffff;
					position: relative;
					z-index: 1;
				}
				.rm-filter-subcopy {
					font-size: 13px;
					line-height: 1.5;
					color: rgba(255, 255, 255, 0.86);
					position: relative;
					z-index: 1;
				}
				.rm-filter-pills {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
					position: relative;
					z-index: 1;
				}
				.rm-filter-pill {
					padding: 6px 10px;
					border-radius: 999px;
					font-size: 11px;
					font-weight: 700;
					background: rgba(255, 255, 255, 0.12);
					border: 1px solid rgba(255, 255, 255, 0.16);
					color: #ffffff;
				}
				.rm-filter-grid {
					display: grid;
					grid-template-columns: repeat(4, minmax(0, 1fr));
					gap: 12px;
					align-items: end;
				}
				.rm-filter-control .form-group {
					margin-bottom: 0;
				}
				.rm-filter-control {
					position: relative;
					padding: 0;
					transition: transform .18s ease;
				}
				.rm-filter-control:hover {
					transform: translateY(-1px);
				}
				.rm-filter-control:focus-within {
					transform: translateY(-1px);
				}
				.rm-filter-control .control-label {
					color: #5c6c7c;
					font-size: 10px;
					text-transform: uppercase;
					letter-spacing: 0.1em;
					margin-bottom: 6px;
					font-weight: 700;
				}
				.rm-filter-control .form-control {
					background: #f8fbfd;
					border: 1px solid #d4dde4;
					font-weight: 600;
					border-radius: 12px;
					min-height: 44px;
					transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease, background .18s ease;
					position: relative;
					z-index: 1;
					box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
				}
				.rm-filter-control .form-control:hover {
					background: #ffffff;
					border-color: #c1d0d9;
				}
				.rm-filter-control .form-control:focus {
					background: #ffffff;
					border-color: #2ecc71;
					box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.12);
					transform: translateY(-1px);
				}
				.rm-filter-control select.form-control {
					padding-right: 34px;
					appearance: none;
					background-image:
						linear-gradient(45deg, transparent 50%, #5c6c7c 50%),
						linear-gradient(135deg, #5c6c7c 50%, transparent 50%);
					background-position:
						calc(100% - 18px) calc(50% - 3px),
						calc(100% - 12px) calc(50% - 3px);
					background-size: 6px 6px, 6px 6px;
					background-repeat: no-repeat;
				}
				.rm-filter-actions {
					display: flex;
					justify-content: flex-end;
					align-items: end;
					gap: 8px;
					position: relative;
					grid-column: 1 / -1;
					padding-top: 6px;
				}
				.rm-filter-actions .btn {
					position: relative;
					z-index: 1;
					min-width: 132px;
					min-height: 44px;
					font-weight: 700;
					border-radius: 999px;
					letter-spacing: 0.01em;
				}
				.rm-active-filter,
				.rm-loading {
					margin-top: 10px;
					font-size: 12px;
					font-weight: 600;
				}
				.rm-active-filter {
					color: #2c3e50;
					display: inline-flex;
					align-items: center;
					gap: 8px;
					padding: 8px 12px;
					border-radius: 999px;
					background: rgba(255, 255, 255, 0.78);
					border: 1px solid rgba(209, 216, 221, 0.88);
					box-shadow: 0 8px 16px rgba(44, 62, 80, 0.05);
				}
				.rm-active-filter::before {
					content: "";
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: #27ae60;
					box-shadow: 0 0 0 5px rgba(39, 174, 96, 0.12);
				}
				.rm-loading {
					color: #d35400;
					padding-left: 4px;
				}
				.rm-grid {
					display: grid;
					grid-template-columns: repeat(12, minmax(0, 1fr));
					gap: 14px;
					margin-top: 14px;
				}
				.rm-card,
				.rm-panel {
					background: var(--rm-surface);
					border: 1px solid var(--rm-border);
					box-shadow: var(--rm-shadow);
					backdrop-filter: blur(8px);
				}
				.rm-card {
					grid-column: span 3;
					border-radius: 16px;
					padding: 14px;
					transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
					position: relative;
					overflow: hidden;
					animation: rmFadeUp .5s ease-out both;
				}
				.rm-card::after {
					content: "";
					position: absolute;
					inset: auto -30% -60% auto;
					width: 140px;
					height: 140px;
					border-radius: 50%;
					background: radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 68%);
					pointer-events: none;
				}
				.rm-card:nth-child(1) { animation-delay: .04s; }
				.rm-card:nth-child(2) { animation-delay: .08s; }
				.rm-card:nth-child(3) { animation-delay: .12s; }
				.rm-card:nth-child(4) { animation-delay: .16s; }
				.rm-card:nth-child(5) { animation-delay: .20s; }
				.rm-card:nth-child(6) { animation-delay: .24s; }
				.rm-card:nth-child(7) { animation-delay: .28s; }
				.rm-card:nth-child(8) { animation-delay: .32s; }
				.rm-card[data-route-key] {
					cursor: pointer;
				}
				.rm-card[data-route-key]:hover {
					transform: translateY(-5px) scale(1.01);
					box-shadow: 0 16px 28px rgba(44, 62, 80, 0.14);
				}
				.rm-card--green {
					background: #ffffff;
					border-top: 8px solid #2ecc71;
				}
				.rm-card--red {
					background: #fff9f9;
					border-top: 8px solid #e74c3c;
				}
				.rm-card--amber {
					background: #fffaf0;
					border-top: 8px solid #f39c12;
				}
				.rm-card--slate {
					background: #f8fafb;
					border-top: 8px solid #95a5a6;
				}
				.rm-card--blue {
					background: #f5f9ff;
					border-top: 8px solid #3498db;
				}
				.rm-card--mint {
					background: #f6fffb;
					border-top: 8px solid #1abc9c;
				}
				.rm-card--gold {
					background: #fff9ef;
					border-top: 8px solid #e67e22;
				}
				.rm-card--pearl {
					background: #fdfefe;
					border-top: 8px solid #7f8c8d;
				}
				.rm-kpi-title {
					font-size: 11px;
					text-transform: uppercase;
					letter-spacing: 0.08em;
					color: var(--rm-subtext);
					margin-bottom: 6px;
				}
				.rm-kpi-value {
					font-size: 32px;
					line-height: 1;
					font-weight: 700;
					color: var(--rm-text);
					letter-spacing: -0.02em;
				}
				.rm-kpi-sub {
					margin-top: 5px;
					font-size: 12px;
					color: var(--rm-subtext);
				}
				.rm-kpi-link {
					margin-top: 8px;
					font-size: 11px;
					font-weight: 600;
					color: #2980b9;
				}
				.rm-panel {
					border-radius: 18px;
					padding: 14px;
					position: relative;
					animation: rmFadeUp .55s ease-out both;
				}
				.rm-panel:nth-of-type(1) { animation-delay: .18s; }
				.rm-panel:nth-of-type(2) { animation-delay: .24s; }
				.rm-panel:nth-of-type(3) { animation-delay: .30s; }
				.rm-panel:nth-of-type(4) { animation-delay: .36s; }
				.rm-panel h4 {
					margin: 0 0 10px;
					font-size: 16px;
					padding-left: 11px;
					color: var(--rm-text);
				}
				.rm-panel h4::before {
					content: "";
					position: absolute;
					left: 14px;
					width: 4px;
					height: 20px;
					border-radius: 4px;
					background: linear-gradient(180deg, #27ae60, #2980b9);
				}
				.rm-left {
					grid-column: span 8;
				}
				.rm-right {
					grid-column: span 4;
				}
				.rm-chart {
					min-height: 280px;
				}
				.rm-list {
					display: grid;
					gap: 10px;
				}
				.rm-item {
					padding: 10px 12px;
					border-radius: 12px;
					border: 1px solid #d1d8dd;
					background: #ffffff;
					transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
				}
				.rm-item:hover {
					transform: translateY(-2px);
					border-color: #b8c4cc;
					box-shadow: 0 10px 18px rgba(44, 62, 80, 0.08);
				}
				.rm-item b {
					color: var(--rm-text);
				}
				.rm-tag {
					display: inline-block;
					padding: 2px 8px;
					border-radius: 999px;
					font-size: 11px;
					font-weight: 600;
					margin-right: 6px;
				}
				.rm-tag--green {
					background: #ddf7e7;
					color: #1f7a48;
					animation: rmPulseGlow 2.8s ease-in-out infinite;
				}
				.rm-tag--red {
					background: #ffe5e1;
					color: #b83b2f;
				}
				.rm-tag--amber {
					background: #fff1d6;
					color: #a75a00;
				}
				.rm-tag--slate {
					background: #e9eef2;
					color: #415261;
				}
				@media (max-width: 1380px) {
					.rm-filters {
						grid-template-columns: 1fr;
					}
					.rm-filter-grid {
						grid-template-columns: repeat(2, minmax(0, 1fr));
					}
				}
				@media (max-width: 1200px) {
					.rm-card {
						grid-column: span 6;
					}
					.rm-left,
					.rm-right {
						grid-column: span 12;
					}
				}
				@media (max-width: 700px) {
					.rm-card,
					.rm-filter-grid {
						grid-column: span 12;
						grid-template-columns: 1fr;
					}
					.rm-hero h2 {
						font-size: 24px;
					}
					.rm-filter-actions {
						justify-content: stretch;
						flex-wrap: wrap;
						padding-top: 0;
					}
					.rm-filter-actions .btn {
						flex: 1 1 100%;
					}
				}
				@media (prefers-reduced-motion: reduce) {
					.rm-dashboard-shell *,
					.rm-dashboard-shell::before,
					.rm-dashboard-shell::after,
					.rm-hero::before,
					.rm-hero::after {
						animation: none !important;
						transition: none !important;
					}
				}
			</style>

			<div class="rm-hero">
				<div class="rm-hero-top">
					<div>
						<h2>${__("Restaurant Operations Dashboard")}</h2>
						<p>${__("Monitor table occupancy, service flow, reservations, and daily billing from one page.")}</p>
					</div>
					<div class="rm-hero-actions">
						<button class="btn btn-light" data-action="refresh">${__("Refresh")}</button>
						<button class="btn btn-primary" data-action="occupancy">${__("Open Occupancy Board")}</button>
					</div>
				</div>
				<div class="rm-filters">
					<div class="rm-filter-summary">
						<div>
							<div class="rm-filter-kicker">${__("Service Filters")}</div>
							<div class="rm-filter-headline">${__("Refine the floor view")}</div>
							<div class="rm-filter-subcopy">${__("Pick a date window and branch to focus the restaurant dashboard on the service window you care about.")}</div>
						</div>
						<div class="rm-filter-pills">
							<span class="rm-filter-pill">${__("Live Tables")}</span>
							<span class="rm-filter-pill">${__("Reservations")}</span>
							<span class="rm-filter-pill">${__("Billing")}</span>
						</div>
					</div>
					<div class="rm-filter-grid">
						<div class="rm-filter-control" data-control="range"></div>
						<div class="rm-filter-control" data-control="from_date"></div>
						<div class="rm-filter-control" data-control="to_date"></div>
						<div class="rm-filter-control" data-control="branch"></div>
						<div class="rm-filter-actions">
							<button class="btn btn-warning" data-action="apply_filters">${__("Apply Filters")}</button>
							<button class="btn btn-default" data-action="reset_filters">${__("Reset")}</button>
						</div>
					</div>
				</div>
				<div class="rm-active-filter" data-role="active_filter_text"></div>
				<div class="rm-loading" data-role="loading_text"></div>
			</div>

			<div class="rm-grid">
				<div class="rm-card rm-card--green" data-route-key="active_tables">
					<div class="rm-kpi-title">${__("Active Tables")}</div>
					<div class="rm-kpi-value" data-kpi="active_tables">0</div>
					<div class="rm-kpi-sub">${__("Enabled for service")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--red" data-route-key="occupied_tables">
					<div class="rm-kpi-title">${__("Occupied Tables")}</div>
					<div class="rm-kpi-value" data-kpi="occupied_tables">0</div>
					<div class="rm-kpi-sub">${__("Currently serving guests")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--amber" data-route-key="reserved_tables">
					<div class="rm-kpi-title">${__("Reserved Tables")}</div>
					<div class="rm-kpi-value" data-kpi="reserved_tables">0</div>
					<div class="rm-kpi-sub">${__("Held for arriving guests")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--slate" data-route-key="cleaning_tables">
					<div class="rm-kpi-title">${__("Cleaning Tables")}</div>
					<div class="rm-kpi-value" data-kpi="cleaning_tables">0</div>
					<div class="rm-kpi-sub">${__("Turning tables for next service")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--blue" data-route-key="live_orders">
					<div class="rm-kpi-title">${__("Live Orders")}</div>
					<div class="rm-kpi-value" data-kpi="live_orders">0</div>
					<div class="rm-kpi-sub">${__("Open to served workflow")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--mint" data-route-key="todays_reservations">
					<div class="rm-kpi-title">${__("Today's Reservations")}</div>
					<div class="rm-kpi-value" data-kpi="todays_reservations">0</div>
					<div class="rm-kpi-sub">${__("Requested, confirmed, and checked-in today")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--gold" data-route-key="todays_revenue">
					<div class="rm-kpi-title">${__("Today's Revenue")}</div>
					<div class="rm-kpi-value" data-kpi="todays_revenue">0</div>
					<div class="rm-kpi-sub">${__("Submitted invoices for today")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
				<div class="rm-card rm-card--pearl" data-route-key="pending_bills">
					<div class="rm-kpi-title">${__("Pending Bills")}</div>
					<div class="rm-kpi-value" data-kpi="pending_bills">0</div>
					<div class="rm-kpi-sub">${__("Outstanding invoice amount")}</div>
					<div class="rm-kpi-link">${__("View records")}</div>
				</div>
			</div>

			<div class="rm-grid">
				<div class="rm-panel rm-left">
					<h4>${__("Orders / Reservations / Billing Trend")}</h4>
					<div class="rm-chart" data-chart="service_trend"></div>
				</div>
				<div class="rm-panel rm-right">
					<h4>${__("Table Status Mix")}</h4>
					<div class="rm-chart" data-chart="table_status"></div>
				</div>
				<div class="rm-panel rm-left">
					<h4>${__("Floor Snapshot")}</h4>
					<div class="rm-list" data-role="floor_snapshot"></div>
				</div>
				<div class="rm-panel rm-right">
					<h4>${__("Recent Activity")}</h4>
					<div class="rm-list" data-role="recent_activity"></div>
				</div>
			</div>
		</div>
	`);

	$(wrapper).find(".layout-main-section").empty().append(shell);

	const makeControl = (df, parent) => {
		const control = frappe.ui.form.make_control({ df, parent, render_input: true });
		control.refresh();
		return control;
	};

	const today = frappe.datetime.get_today();
	const controls = {
		range: makeControl({
			fieldtype: "Select",
			fieldname: "range",
			label: __("Date Range"),
			options: "Last 7 Days\nLast 14 Days\nLast 30 Days\nCustom",
			default: "Last 7 Days"
		}, shell.find("[data-control='range']")),
		from_date: makeControl({
			fieldtype: "Date",
			fieldname: "from_date",
			label: __("From Date"),
			default: frappe.datetime.add_days(today, -6)
		}, shell.find("[data-control='from_date']")),
		to_date: makeControl({
			fieldtype: "Date",
			fieldname: "to_date",
			label: __("To Date"),
			default: today
		}, shell.find("[data-control='to_date']")),
		branch: makeControl({
			fieldtype: "Select",
			fieldname: "branch",
			label: __("Restaurant Branch"),
			options: "\nLoading branches..."
		}, shell.find("[data-control='branch']"))
	};

	const formatAsText = (value, df) => {
		const raw = frappe.format(value || 0, df);
		return $("<div>").html(raw).text().trim();
	};

	const fmtNumber = (value) => formatAsText(value, { fieldtype: "Int" });
	const fmtCurrency = (value) => formatAsText(value, { fieldtype: "Currency" });

	const getList = async (doctype, options = {}) => {
		const res = await frappe.call("frappe.client.get_list", {
			doctype,
			fields: options.fields || ["name"],
			filters: options.filters || {},
			order_by: options.order_by || "modified desc",
			limit_page_length: options.limit_page_length || 20
		});
		return res.message || [];
	};

	const getFilterValues = () => ({
		range: controls.range.get_value() || "Last 7 Days",
		from_date: controls.from_date.get_value(),
		to_date: controls.to_date.get_value(),
		branch: controls.branch.get_value() || ""
	});

	const normalizeDates = (filters) => {
		if (!filters.from_date || !filters.to_date) {
			return {
				...filters,
				from_date: frappe.datetime.add_days(frappe.datetime.get_today(), -6),
				to_date: frappe.datetime.get_today()
			};
		}
		if (filters.from_date > filters.to_date) {
			return { ...filters, from_date: filters.to_date, to_date: filters.from_date };
		}
		return filters;
	};

	const setRangeDefaults = () => {
		const range = controls.range.get_value();
		const toDate = frappe.datetime.get_today();
		if (range === "Custom") {
			controls.from_date.$input.prop("disabled", false);
			controls.to_date.$input.prop("disabled", false);
			return;
		}

		controls.from_date.$input.prop("disabled", true);
		controls.to_date.$input.prop("disabled", true);

		const offset = range === "Last 30 Days" ? -29 : range === "Last 14 Days" ? -13 : -6;
		controls.from_date.set_value(frappe.datetime.add_days(toDate, offset));
		controls.to_date.set_value(toDate);
	};

	const getDateKeys = (fromDate, toDate) => {
		const keys = [];
		let cursor = fromDate;
		while (cursor <= toDate) {
			keys.push(cursor);
			cursor = frappe.datetime.add_days(cursor, 1);
		}
		return keys;
	};

	const getStatusTag = (status) => {
		if (["Occupied", "Cancelled", "Closed"].includes(status)) return "rm-tag rm-tag--red";
		if (["Reserved", "Ready"].includes(status)) return "rm-tag rm-tag--amber";
		if (["Free", "Confirmed", "Checked-In", "Complete"].includes(status)) return "rm-tag rm-tag--green";
		return "rm-tag rm-tag--slate";
	};

	const setKpi = (key, value) => {
		shell.find(`[data-kpi='${key}']`).text(value);
	};

	const setLoadingState = (loading, text = "") => {
		state.isLoading = loading;
		shell.find("[data-role='loading_text']").text(loading ? (text || __("Loading dashboard...")) : "");
		shell.find("[data-action='apply_filters']").prop("disabled", loading);
		shell.find("[data-action='refresh']").prop("disabled", loading);
	};

	const setActiveFilterText = (filters) => {
		const parts = [
			`${__("Range")}: ${frappe.datetime.str_to_user(filters.from_date)} -> ${frappe.datetime.str_to_user(filters.to_date)}`
		];
		if (filters.branch) parts.push(`${__("Branch")}: ${filters.branch}`);
		shell.find("[data-role='active_filter_text']").text(parts.join(" | "));
	};

	const buildTrendData = (orders, reservations, invoices, fromDate, toDate) => {
		const keys = getDateKeys(fromDate, toDate);
		const labels = keys.map((date) => frappe.datetime.str_to_user(date).slice(0, 6));
		const index = {};
		const orderData = keys.map(() => 0);
		const reservationData = keys.map(() => 0);
		const billingData = keys.map(() => 0);

		keys.forEach((date, i) => {
			index[date] = i;
		});

		(orders || []).forEach((row) => {
			const key = (row.creation || "").slice(0, 10);
			if (index[key] !== undefined) orderData[index[key]] += 1;
		});
		(reservations || []).forEach((row) => {
			const key = (row.datetime || "").slice(0, 10);
			if (index[key] !== undefined) reservationData[index[key]] += 1;
		});
		(invoices || []).forEach((row) => {
			const key = row.posting_date;
			if (index[key] !== undefined) billingData[index[key]] += 1;
		});

		return { labels, orderData, reservationData, billingData };
	};

	const renderTrendChart = (labels, orderData, reservationData, billingData) => {
		const container = shell.find("[data-chart='service_trend']").get(0);
		container.innerHTML = "";
		new frappe.Chart(container, {
			data: {
				labels,
				datasets: [
					{ name: __("Orders"), values: orderData },
					{ name: __("Reservations"), values: reservationData },
					{ name: __("Billing"), values: billingData }
				]
			},
			type: "line",
			height: 290,
			colors: ["#e74c3c", "#f39c12", "#2ecc71"],
			lineOptions: { hideDots: 0, regionFill: 1 }
		});
	};

	const renderTableStatusChart = (labels, values) => {
		const container = shell.find("[data-chart='table_status']").get(0);
		container.innerHTML = "";
		new frappe.Chart(container, {
			data: { labels, datasets: [{ values }] },
			type: "donut",
			height: 290,
			colors: ["#2ecc71", "#e74c3c", "#f39c12", "#95a5a6", "#3498db"]
		});
	};

	const renderFloorSnapshot = (tables) => {
		const target = shell.find("[data-role='floor_snapshot']");
		if (!tables.length) {
			target.html(`<div class="rm-item">${__("No table records found for selected filters.")}</div>`);
			return;
		}

		const grouped = {};
		tables.forEach((row) => {
			const floor = row.floor || __("No Floor");
			if (!grouped[floor]) {
				grouped[floor] = { total: 0, occupied: 0, reserved: 0, free: 0, cleaning: 0, seats: 0 };
			}
			grouped[floor].total += 1;
			grouped[floor].seats += row.seating_capacity || 0;
			if (row.status === "Occupied") grouped[floor].occupied += 1;
			else if (row.status === "Reserved") grouped[floor].reserved += 1;
			else if (row.status === "Cleaning") grouped[floor].cleaning += 1;
			else grouped[floor].free += 1;
		});

		target.html(Object.entries(grouped).map(([floor, info]) => `
			<div class="rm-item">
				<b>${frappe.utils.escape_html(floor)}</b><br>
				${__("Tables")}: ${info.total} | ${__("Seats")}: ${info.seats}<br>
				<span class="rm-tag rm-tag--green">${__("Free")}: ${info.free}</span>
				<span class="rm-tag rm-tag--red">${__("Occupied")}: ${info.occupied}</span>
				<span class="rm-tag rm-tag--amber">${__("Reserved")}: ${info.reserved}</span>
				<span class="rm-tag rm-tag--slate">${__("Cleaning")}: ${info.cleaning}</span>
			</div>
		`).join(""));
	};

	const renderRecentActivity = (items) => {
		const target = shell.find("[data-role='recent_activity']");
		if (!items.length) {
			target.html(`<div class="rm-item">${__("No recent activity found for selected filters.")}</div>`);
			return;
		}

		target.html(items.map((item) => `
			<div class="rm-item">
				<b>${frappe.utils.escape_html(item.title)}</b><br>
				${frappe.utils.escape_html(item.meta)}<br>
				<span class="${getStatusTag(item.status)}">${frappe.utils.escape_html(item.status || __("Open"))}</span>
				${frappe.utils.escape_html(item.when)}
			</div>
		`).join(""));
	};

	const setKpiRoute = (key, doctype, filters) => {
		state.kpiRoutes[key] = { doctype, filters };
	};

	const buildNameFilter = (names) => {
		if (names === null) return null;
		if (!names.length) return ["in", ["__none__"]];
		return ["in", names];
	};

	const loadBranchOptions = async () => {
		try {
			const branches = await getList("Branch", {
				fields: ["name"],
				order_by: "name asc",
				limit_page_length: 1000
			});
			const options = ["", ...branches.map((row) => row.name)];
			controls.branch.df.options = options.join("\n");
			controls.branch.refresh();
		} catch (e) {
			controls.branch.df.options = "\nUnable to load branches";
			controls.branch.refresh();
		}
	};

	const refreshDashboard = async () => {
		if (state.isLoading) return;
		const filters = normalizeDates(getFilterValues());
		setActiveFilterText(filters);
		setLoadingState(true, __("Applying filters..."));

		try {
			const tableFilters = {};
			const reservationFilters = [
				["datetime", "between", [`${filters.from_date} 00:00:00`, `${filters.to_date} 23:59:59`]]
			];
			const orderFilters = [
				["creation", "between", [`${filters.from_date} 00:00:00`, `${filters.to_date} 23:59:59`]]
			];
			const invoiceFilters = {
				docstatus: 1,
				posting_date: ["between", [filters.from_date, filters.to_date]]
			};

			if (filters.branch) {
				tableFilters.restaurant_branch = filters.branch;
				reservationFilters.push(["restaurant_branch", "=", filters.branch]);
				orderFilters.push(["restaurant_branch", "=", filters.branch]);
			}

			const [tables, reservations, orders] = await Promise.all([
				getList("Restaurant Table", {
					fields: ["name", "table_number", "status", "seating_capacity", "floor", "is_active", "restaurant_branch", "modified"],
					filters: tableFilters,
					order_by: "floor asc, table_number asc",
					limit_page_length: 5000
				}),
				getList("Reservation", {
					fields: ["name", "customer", "datetime", "guest_no", "workflow_state", "restaurant_branch", "modified"],
					filters: reservationFilters,
					order_by: "datetime desc",
					limit_page_length: 5000
				}),
				getList("Restaurant Order", {
					fields: ["name", "customer", "order_type", "table", "workflow_state", "restaurant_branch", "creation", "modified"],
					filters: orderFilters,
					order_by: "creation desc",
					limit_page_length: 5000
				})
			]);

			const orderNames = orders.map((row) => row.name);
			const orderNameFilter = buildNameFilter(orderNames);
			if (filters.branch) {
				invoiceFilters.custom_restaurant_order = orderNameFilter;
			}

			const invoices = await getList("Sales Invoice", {
				fields: ["name", "customer", "posting_date", "grand_total", "outstanding_amount", "status", "custom_restaurant_order", "modified"],
				filters: invoiceFilters,
				order_by: "posting_date desc, modified desc",
				limit_page_length: 5000
			});

			const activeTables = tables.filter((row) => cint(row.is_active) === 1);
			const occupiedTables = tables.filter((row) => row.status === "Occupied");
			const reservedTables = tables.filter((row) => row.status === "Reserved");
			const cleaningTables = tables.filter((row) => row.status === "Cleaning");
			const liveOrders = orders.filter((row) => ["Open", "Cooking", "Ready", "Served"].includes(row.workflow_state || "Open"));
			const todayReservations = reservations.filter((row) => (row.datetime || "").slice(0, 10) === today && row.workflow_state !== "Cancelled");
			const todaysInvoices = invoices.filter((row) => row.posting_date === today);
			const todaysRevenue = todaysInvoices.reduce((sum, row) => sum + flt(row.grand_total), 0);
			const pendingBills = invoices.reduce((sum, row) => sum + (flt(row.outstanding_amount) > 0 ? flt(row.outstanding_amount) : 0), 0);

			setKpi("active_tables", fmtNumber(activeTables.length));
			setKpi("occupied_tables", fmtNumber(occupiedTables.length));
			setKpi("reserved_tables", fmtNumber(reservedTables.length));
			setKpi("cleaning_tables", fmtNumber(cleaningTables.length));
			setKpi("live_orders", fmtNumber(liveOrders.length));
			setKpi("todays_reservations", fmtNumber(todayReservations.length));
			setKpi("todays_revenue", fmtCurrency(todaysRevenue));
			setKpi("pending_bills", fmtCurrency(pendingBills));

			const tableStatusMap = {};
			tables.forEach((row) => {
				const key = row.status || __("Unknown");
				tableStatusMap[key] = (tableStatusMap[key] || 0) + 1;
			});
			const statusLabels = Object.keys(tableStatusMap);
			const statusValues = statusLabels.map((label) => tableStatusMap[label]);
			renderTableStatusChart(statusLabels.length ? statusLabels : [__("No Data")], statusValues.length ? statusValues : [1]);

			const trend = buildTrendData(orders, reservations, invoices, filters.from_date, filters.to_date);
			renderTrendChart(trend.labels, trend.orderData, trend.reservationData, trend.billingData);

			renderFloorSnapshot(tables);

			const recentItems = [
				...orders.slice(0, 4).map((row) => ({
					title: row.name,
					meta: `${row.customer || __("Walk-in")} | ${row.order_type || __("Dine-In")} | ${row.table || __("No Table")}`,
					status: row.workflow_state || __("Open"),
					when: frappe.datetime.str_to_user((row.creation || "").slice(0, 10)),
					sort_key: row.creation || ""
				})),
				...reservations.slice(0, 4).map((row) => ({
					title: row.name,
					meta: `${row.customer || __("Guest")} | ${__("Guests")}: ${row.guest_no || 0}`,
					status: row.workflow_state || __("Requested"),
					when: frappe.datetime.str_to_user((row.datetime || "").slice(0, 10)),
					sort_key: row.datetime || ""
				})),
				...invoices.slice(0, 4).map((row) => ({
					title: row.name,
					meta: `${row.customer || __("Guest")} | ${fmtCurrency(row.grand_total)}`,
					status: flt(row.outstanding_amount) > 0 ? __("Unpaid") : __("Paid"),
					when: frappe.datetime.str_to_user(row.posting_date),
					sort_key: `${row.posting_date || ""} 00:00:00`
				}))
			]
				.filter((row) => row.when)
				.sort((a, b) => (b.sort_key || "").localeCompare(a.sort_key || ""))
				.slice(0, 6);

			renderRecentActivity(recentItems);

			const tableRouteFilters = filters.branch ? { restaurant_branch: filters.branch } : {};
			const liveOrderRouteFilters = filters.branch
				? { workflow_state: ["in", ["Open", "Cooking", "Ready", "Served"]], restaurant_branch: filters.branch }
				: { workflow_state: ["in", ["Open", "Cooking", "Ready", "Served"]] };
			const todayReservationRouteFilters = {
				datetime: ["between", [`${today} 00:00:00`, `${today} 23:59:59`]]
			};
			if (filters.branch) todayReservationRouteFilters.restaurant_branch = filters.branch;
			const invoiceRouteFilters = { docstatus: 1, posting_date: today };
			if (filters.branch) {
				invoiceRouteFilters.custom_restaurant_order = orderNameFilter;
			}

			setKpiRoute("active_tables", "Restaurant Table", { ...tableRouteFilters, is_active: 1 });
			setKpiRoute("occupied_tables", "Restaurant Table", { ...tableRouteFilters, status: "Occupied" });
			setKpiRoute("reserved_tables", "Restaurant Table", { ...tableRouteFilters, status: "Reserved" });
			setKpiRoute("cleaning_tables", "Restaurant Table", { ...tableRouteFilters, status: "Cleaning" });
			setKpiRoute("live_orders", "Restaurant Order", liveOrderRouteFilters);
			setKpiRoute("todays_reservations", "Reservation", todayReservationRouteFilters);
			setKpiRoute("todays_revenue", "Sales Invoice", invoiceRouteFilters);
			setKpiRoute("pending_bills", "Sales Invoice", { ...invoiceRouteFilters, outstanding_amount: [">", 0] });
		} catch (e) {
			console.error(e);
			frappe.msgprint({
				title: __("Unable to load dashboard"),
				message: __("Some restaurant dashboard data could not be loaded. Please check DocType permissions and field availability."),
				indicator: "red"
			});
		} finally {
			setLoadingState(false);
		}
	};

	const openKpiRoute = (routeKey) => {
		const config = state.kpiRoutes[routeKey];
		if (!config) return;
		frappe.route_options = config.filters || {};
		frappe.set_route("List", config.doctype);
	};

	shell.find("[data-route-key]").on("click", function () {
		openKpiRoute($(this).attr("data-route-key"));
	});

	shell.find("[data-action='refresh']").on("click", refreshDashboard);
	shell.find("[data-action='occupancy']").on("click", () => frappe.set_route("restaurant-table-lay"));
	shell.find("[data-action='apply_filters']").on("click", refreshDashboard);
	shell.find("[data-action='reset_filters']").on("click", () => {
		controls.range.set_value("Last 7 Days");
		controls.branch.set_value("");
		setRangeDefaults();
		refreshDashboard();
	});

	controls.range.$input.on("change", () => {
		setRangeDefaults();
	});

	setRangeDefaults();
	loadBranchOptions().then(() => refreshDashboard());
};
